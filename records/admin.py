from django.contrib import admin
from django.utils.translation import gettext_lazy as _
import datetime

from .models import Passenger, LaborerInfo, MerchantInfo, TransitInfo, WifeChildInfo, ExemptInfo
from .admin_filters import CategoryFilter  

from django.utils.translation import gettext_lazy as _
from django.db.models import F, Q, Case, When, IntegerField, ExpressionWrapper
from django.db.models.functions import ExtractYear, ExtractMonth, ExtractDay

import datetime

# -------------------------
# Age Group Filter
# -------------------------

class AgeGroupFilter(admin.SimpleListFilter):
    title = _("Age Group")
    parameter_name = "age_group"

    def lookups(self, request, model_admin):
        return [
            ("child", _("Child (<18 at arrival)")),
            ("adult", _("Adult (18–59 at arrival)")),
            ("elder", _("Elder (60+ at arrival)")),
            ("unknown", _("Unknown (missing birth/arrival date)")),
        ]

    def queryset(self, request, queryset):
        val = self.value()
        if not val:
            return queryset

        if val == "unknown":
            # Missing date_of_birth or arrival_date
            return queryset.filter(Q(date_of_birth__isnull=True) | Q(arrival_date__isnull=True))

        # Only rows where both dates exist
        qs = queryset.exclude(date_of_birth__isnull=True).exclude(arrival_date__isnull=True)

        # Compute exact age in years at arrival:
        # age_years = (arrival.year - dob.year) - 1 if arrival month/day < dob month/day else (arrival.year - dob.year)
        qs = qs.annotate(
            dob_month=ExtractMonth("date_of_birth"),
            dob_day=ExtractDay("date_of_birth"),
            year_diff=ExtractYear("arrival_date") - ExtractYear("date_of_birth"),
            before_birthday=Case(
                When(
                    Q(arrival_date__month__lt=F("dob_month")) |
                    (Q(arrival_date__month=F("dob_month")) & Q(arrival_date__day__lt=F("dob_day"))),
                    then=1
                ),
                default=0,
                output_field=IntegerField(),
            ),
            age_at_arrival=F("year_diff") - F("before_birthday"),
        )

        if val == "child":
            return qs.filter(age_at_arrival__lt=18)
        if val == "adult":
            return qs.filter(age_at_arrival__gte=18, age_at_arrival__lt=60)
        if val == "elder":
            return qs.filter(age_at_arrival__gte=60)

        return queryset

# -------------------------
# Inlines for Related Models
# -------------------------
class LaborerInline(admin.StackedInline):
    model = LaborerInfo
    extra = 0


class MerchantInline(admin.StackedInline):
    model = MerchantInfo
    extra = 0


class TransitInline(admin.StackedInline):
    model = TransitInfo
    extra = 0


class WifeChildInline(admin.StackedInline):
    model = WifeChildInfo
    extra = 0


class ExemptInline(admin.StackedInline):
    model = ExemptInfo
    extra = 0


# -------------------------
# Passenger Admin
# -------------------------
@admin.register(Passenger)
class PassengerAdmin(admin.ModelAdmin):
    list_display = (
        "naid", "ship_name", "departure_port", "arrival_port", "arrival_date",
        "passenger_class", "image_no", "line_no",
        "name_individual", "name_family", "name_tribal", "chinese_signature", "sex",
        "pob_city_raw", "pob_district_raw", "pob_country",
        "date_of_birth", "date_of_birth_raw", "destination",
    )

    search_fields = (
        "naid", "name_individual", "name_family", "ship_name", "arrival_port", "destination",
    )

    list_filter = (
        CategoryFilter, "arrival_port", "sex", "pob_country", "passenger_class",
        AgeGroupFilter,   # 👈 categories now checkbox-based
    )

    fieldsets = (
        ("Basic Info", {
            "fields": ("naid", "ship_name", "departure_port", "arrival_port",
                       "arrival_date", "passenger_class", "image_no", "line_no")
        }),
        ("Name", {
            "fields": ("name_individual", "name_family", "name_tribal", "chinese_signature", "sex")
        }),
        ("Place of Birth", {
            "fields": ("pob_city_chinese", "pob_city_std", "pob_city_raw",
                       "pob_district_chinese", "pob_district_std", "pob_district_raw",
                       "pob_country")
        }),
        ("Other", {
            "fields": ("date_of_birth", "date_of_birth_raw", "destination", "physical_markers")
        }),
    )

    inlines = [LaborerInline, MerchantInline, TransitInline, WifeChildInline, ExemptInline]
