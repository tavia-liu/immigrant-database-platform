from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.db.models import F, Q, Case, When, IntegerField
from django.db.models.functions import ExtractYear, ExtractMonth, ExtractDay
from django.http import HttpResponse
import csv

from .models import (
    Passenger, LaborerInfo, MerchantInfo, TransitInfo, WifeChildInfo, ExemptInfo
)
from .admin_filters import CategoryFilter


# -------------------------
# Age Group Filter
# -------------------------
class AgeGroupFilter(admin.SimpleListFilter):
    title = _("Age Group")
    parameter_name = "age_group"

    def lookups(self, request, model_admin):
        return [
            ("child", _("Child (<18)")),
            ("adult", _("Adult (18–59)")),
            ("elder", _("Elder (60+)")),
            ("unknown", _("Unknown")),
        ]

    def queryset(self, request, qs):
        val = self.value()
        if not val:
            return qs
        if val == "unknown":
            return qs.filter(Q(date_of_birth__isnull=True) | Q(arrival_date__isnull=True))

        qs = qs.exclude(date_of_birth__isnull=True, arrival_date__isnull=True).annotate(
            dob_m=ExtractMonth("date_of_birth"),
            dob_d=ExtractDay("date_of_birth"),
            diff_y=ExtractYear("arrival_date") - ExtractYear("date_of_birth"),
            before_bd=Case(
                When(
                    Q(arrival_date__month__lt=F("dob_m"))
                    | (Q(arrival_date__month=F("dob_m")) & Q(arrival_date__day__lt=F("dob_d"))),
                    then=1,
                ),
                default=0,
                output_field=IntegerField(),
            ),
            age=F("diff_y") - F("before_bd"),
        )

        if val == "child":
            return qs.filter(age__lt=18)
        if val == "adult":
            return qs.filter(age__gte=18, age__lt=60)
        if val == "elder":
            return qs.filter(age__gte=60)
        return qs


# -------------------------
# Dynamic CSV Export
# -------------------------
def export_passengers_csv(modeladmin, request, queryset):
    """Export selected passengers and related info to CSV."""
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = "attachment; filename=passengers.csv"
    writer = csv.writer(response)

    # All models to include
    related_models = {
        "laborer": LaborerInfo,
        "merchant": MerchantInfo,
        "transit": TransitInfo,
        "wifechild": WifeChildInfo,
        "exempt": ExemptInfo,
    }

    # Collect all field names
    base_fields = [f.name for f in Passenger._meta.fields]
    extra_fields = {
        prefix: [f.name for f in model._meta.fields if f.name not in ("id", "passenger")]
        for prefix, model in related_models.items()
    }
    headers = base_fields + [
        f"{pfx}_{f}" for pfx, flist in extra_fields.items() for f in flist
    ]
    writer.writerow(headers)

    # Write data rows
    for p in queryset:
        row = [getattr(p, f) for f in base_fields]
        for prefix in related_models.keys():
            info = getattr(p, f"{prefix}_info", None)
            fields = extra_fields[prefix]
            row += [getattr(info, f, None) if info else None for f in fields]
        writer.writerow(row)

    return response


export_passengers_csv.short_description = "Export selected passengers (all fields)"


# -------------------------
# Inline generator
# -------------------------
def make_inline(model):
    return type(f"{model.__name__}Inline", (admin.StackedInline,), {"model": model, "extra": 0})


# -------------------------
# Passenger Admin
# -------------------------
@admin.register(Passenger)
class PassengerAdmin(admin.ModelAdmin):
    list_display = (
        "naid", "ship_name", "departure_port", "arrival_port", "arrival_date",
        "passenger_class", "image_no", "line_no", "name_individual", "name_family",
        "name_tribal", "sex", "pob_country", "destination"
    )

    search_fields = ("naid", "name_individual", "name_family", "ship_name", "arrival_port", "destination")
    list_filter = (CategoryFilter, "arrival_port", "sex", "pob_country", "passenger_class", AgeGroupFilter)
    inlines = [make_inline(m) for m in (LaborerInfo, MerchantInfo, TransitInfo, WifeChildInfo, ExemptInfo)]
    actions = [export_passengers_csv]

    def get_actions(self, request):
        actions = super().get_actions(request)
        if not request.user.has_perm("records.view_passenger"):
            return {}
        return actions
