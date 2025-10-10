from django.contrib import admin
from django.utils.translation import gettext_lazy as _

class CheckboxFilter(admin.SimpleListFilter):
    """Base filter that renders multiple checkboxes instead of single select."""
    template = "admin/checkbox_filter.html"   # custom template you created

    def lookups(self, request, model_admin):
        """Subclasses must return list of (value, label)."""
        raise NotImplementedError

    def queryset(self, request, queryset):
        """Apply filtering logic based on selected values."""
        if self.value():
            values = self.value().split(",")
            return self.filter_queryset(queryset, values)
        return queryset

    def choices(self, changelist):
        """Render checkboxes instead of radio buttons."""
        all_values = self.value().split(",") if self.value() else []
        for lookup, title in self.lookup_choices:
            selected = lookup in all_values
            yield {
                "selected": selected,
                "value": lookup,
                "title": title,
                "query_string": changelist.get_query_string(
                    {self.parameter_name: ",".join(
                        [*all_values, lookup] if not selected 
                        else [v for v in all_values if v != lookup]
                    )},
                    remove=[self.parameter_name],
                ),
            }
    

class CategoryFilter(CheckboxFilter):
    title = _("Categories")
    parameter_name = "categories"

    def lookups(self, request, model_admin):
        return [
            ("laborer", _("Laborer")),
            ("merchant", _("Merchant")),
            ("transit", _("Transit")),
            ("wifechild", _("Wife/Child")),
            ("exempt", _("Exempt")),
            ("none", _("No Category")),   # 👈 add new option
        ]

    def filter_queryset(self, queryset, values):
        from django.db.models import Q
        q = None

        if "laborer" in values:
            q = (q | Q(laborer_info__isnull=False)) if q else Q(laborer_info__isnull=False)
        if "merchant" in values:
            q = (q | Q(merchant_info__isnull=False)) if q else Q(merchant_info__isnull=False)
        if "transit" in values:
            q = (q | Q(transit_info__isnull=False)) if q else Q(transit_info__isnull=False)
        if "wifechild" in values:
            q = (q | Q(wifechild_info__isnull=False)) if q else Q(wifechild_info__isnull=False)
        if "exempt" in values:
            q = (q | Q(exempt_info__isnull=False)) if q else Q(exempt_info__isnull=False)

        if "none" in values:
            # Only include passengers who have *all* categories null
            q_none = (
                Q(laborer_info__isnull=True) &
                Q(merchant_info__isnull=True) &
                Q(transit_info__isnull=True) &
                Q(wifechild_info__isnull=True) &
                Q(exempt_info__isnull=True)
            )
            q = (q | q_none) if q else q_none

        if q:
            return queryset.filter(q).distinct()
        return queryset


