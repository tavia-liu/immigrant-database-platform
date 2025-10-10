from django.db import models


# -------------------------
# Core Passenger Table
# -------------------------
class Passenger(models.Model):
    # Basic identifiers
    naid = models.CharField("NAID", max_length=50, blank=True, null=True)
    ship_name = models.CharField("ship name", max_length=100, blank=True, null=True)
    departure_port = models.CharField("depature port", max_length=100, blank=True, null=True)
    arrival_port = models.CharField("arrival port", max_length=100, blank=True, null=True)
    arrival_date = models.DateField("arrival date", blank=True, null=True)
    passenger_class = models.CharField("class", max_length=50, blank=True, null=True)
    image_no = models.CharField("image #", max_length=50, blank=True, null=True)
    line_no = models.CharField("line #", max_length=50, blank=True, null=True)

    # Name subsection
    name_individual = models.CharField("individual", max_length=200, blank=True, null=True)
    name_family = models.CharField("family", max_length=200, blank=True, null=True)
    name_tribal = models.CharField("tribal", max_length=200, blank=True, null=True)

    chinese_signature = models.CharField("Chinese signature", max_length=200, blank=True, null=True)
    sex = models.CharField("sex", max_length=10, blank=True, null=True)

    # Place of birth subsection
    pob_city_chinese = models.CharField("Chinese standardized city/village", max_length=200, blank=True, null=True)
    pob_city_std = models.CharField("standardized city/village", max_length=200, blank=True, null=True)
    pob_city_raw = models.CharField("city/village", max_length=200, blank=True, null=True)
    pob_district_chinese = models.CharField("Chinese standardized district", max_length=200, blank=True, null=True)
    pob_district_std = models.CharField("standardized district", max_length=200, blank=True, null=True)
    pob_district_raw = models.CharField("district", max_length=200, blank=True, null=True)
    pob_country = models.CharField("country", max_length=200, blank=True, null=True)

    date_of_birth = models.DateField("date of birth (parsed)", blank=True, null=True)
    date_of_birth_raw = models.CharField("date of birth (raw text)", max_length=200, blank=True, null=True)
    destination = models.CharField("destination", max_length=200, blank=True, null=True)
    physical_markers = models.TextField("physical markers", blank=True, null=True)

    def __str__(self):
        parts = []
        if self.name_individual:
            parts.append(self.name_individual)
        if self.name_family:
            parts.append(self.name_family)
        if parts:
            return " ".join(parts)
        return "Unknown Passenger"
        


# -------------------------
# LABORERS
# -------------------------
class LaborerInfo(models.Model):
    passenger = models.OneToOneField(Passenger, on_delete=models.CASCADE, related_name="laborer_info")
    cert_residence_no = models.CharField("Number of certificate of residence", max_length=50, blank=True, null=True)
    return_cert_no = models.CharField("Number of return certificate", max_length=50, blank=True, null=True)
    us_residence_city = models.CharField("Place of residence in United States (City)", max_length=100, blank=True, null=True)
    us_residence_state = models.CharField("Place of residence in United States (State)", max_length=100, blank=True, null=True)
    departure_port_us = models.CharField("Port of departure from United States", max_length=100, blank=True, null=True)
    departure_date_us = models.DateField("Date of Departure From United States", blank=True, null=True)
    claim_basis = models.TextField("Basis of Claim to Readmission", blank=True, null=True)
    overtime_certificate = models.CharField("Overtime certificate (consul report)", max_length=200, blank=True, null=True)


# -------------------------
# DOMICILED MERCHANTS
# -------------------------
class MerchantInfo(models.Model):
    passenger = models.OneToOneField(Passenger, on_delete=models.CASCADE, related_name="merchant_info")
    registered_cert_no = models.CharField("If registered, number of certificate of residence", max_length=50, blank=True, null=True)
    return_date_china = models.DateField("Date of Return to China", blank=True, null=True)
    steamship_name = models.CharField("Name of steamship on which returned to China", max_length=100, blank=True, null=True)
    firm_name = models.CharField("Of what firm a member", max_length=200, blank=True, null=True)
    firm_address = models.CharField("Location of firm (address)", max_length=200, blank=True, null=True)
    firm_city = models.CharField("Location of firm (city)", max_length=100, blank=True, null=True)
    members_count = models.IntegerField("# members", blank=True, null=True)
    years_member = models.CharField("How long a member of firm", max_length=50, blank=True, null=True)
    capital_invested = models.DecimalField("Amount of interest in firm", max_digits=12, decimal_places=2, blank=True, null=True)


# -------------------------
# TRANSITS
# -------------------------
class TransitInfo(models.Model):
    passenger = models.OneToOneField(Passenger, on_delete=models.CASCADE, related_name="transit_info")
    cause_departure = models.TextField("Cause of departure from United States", blank=True, null=True)
    us_residence = models.CharField("Residence while in United States", max_length=200, blank=True, null=True)
    us_occupation = models.CharField("Occupation while in United States", max_length=200, blank=True, null=True)
    registered = models.CharField("Whether registered", max_length=50, blank=True, null=True)
    registration_cert_no = models.CharField("Number of registration certification", max_length=50, blank=True, null=True)


# -------------------------
# WIVES AND MINOR CHILDREN OF MERCHANTS
# -------------------------
class WifeChildInfo(models.Model):
    passenger = models.OneToOneField(Passenger, on_delete=models.CASCADE, related_name="wifechild_info")
    husband_or_father = models.CharField("Name of husband or father", max_length=200, blank=True, null=True)
    residence_husband_father_address = models.CharField("Residence of husband or father (address)", max_length=200, blank=True, null=True)
    residence_husband_father_state = models.CharField("Residence of husband or father (state)", max_length=200, blank=True, null=True)
    witnesses = models.TextField("Names and residences of persons cognizant of facts", blank=True, null=True)
    marriage_date = models.DateField("Date of marriage", blank=True, null=True)
    marriage_place = models.CharField("Place of marriage", max_length=200, blank=True, null=True)
    children_names = models.TextField("Name of Children", blank=True, null=True)
    first_and_only_wife = models.CharField("Whether first and only living wife", max_length=50, blank=True, null=True)
    mother_name = models.CharField("Name of mother", max_length=200, blank=True, null=True)
    brothers_names = models.TextField("Names of brothers", blank=True, null=True)
    sisters_names = models.TextField("Names of sisters", blank=True, null=True)


# -------------------------
# EXEMPTS
# -------------------------
class ExemptInfo(models.Model):
    passenger = models.OneToOneField(Passenger, on_delete=models.CASCADE, related_name="exempt_info")
    official_title = models.CharField("Official title / Charter of certificate", max_length=200, blank=True, null=True)
    last_occupation = models.CharField("Last Occupation And Where Pursued", max_length=200, blank=True, null=True)
    occupation_place = models.CharField("Where pursued (occupation)", max_length=200, blank=True, null=True)
    intended_occupation = models.CharField("Intended Occupation In The United States", max_length=200, blank=True, null=True)
    intended_residence = models.CharField("Intended Place Of Residence In The United States", max_length=200, blank=True, null=True)
    intended_duration = models.CharField("How Long Proposes To Remain In The United States", max_length=200, blank=True, null=True)
    study_subject = models.CharField("What Study To Be Pursued", max_length=200, blank=True, null=True)
    school_name = models.CharField("Name Of School Or College Intends To Enter", max_length=200, blank=True, null=True)
