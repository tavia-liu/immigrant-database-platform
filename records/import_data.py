import pandas as pd
from django.db import transaction
from datetime import datetime
from records.models import (
    Passenger,
    LaborerInfo,
    MerchantInfo,
    TransitInfo,
    WifeChildInfo,
    ExemptInfo,
)


def safe_date(value):
    """Convert Excel date/string to Python date or None."""
    if pd.isna(value) or value in ("-", ""):
        return None
    if isinstance(value, datetime):
        return value.date()
    try:
        return pd.to_datetime(value).date()
    except Exception:
        return None


def clean_value(value):
    """Normalize cell values: keep None if blank, otherwise strip strings."""
    if pd.isna(value) or value is None:
        return None
    if isinstance(value, str):
        return value.strip() if value.strip() else None
    return value


def has_data(*fields):
    """Helper: check if any field has real data."""
    return any(
        not pd.isna(f) and f not in (None, "", "-")
        for f in fields
    )


def makePassengerID(naid, line_no, image_no):
    """Create a unique Passenger ID based on NAID, line number, and image number."""
    naid_part = clean_value(naid) or "UNKNOWN"
    line_part = f"Line{clean_value(line_no) or '0'}"
    image_part = f"Image{clean_value(image_no) or '0'}"
    return f"{naid_part}_{line_part}_{image_part}"


def run(file_path="Spreadsheet7.xlsx"):
    print(f"Reading {file_path} ...")
    df = pd.read_excel(file_path, sheet_name="Sheet1")

    print(f"Found {len(df)} rows")
    
    created = 0
    updated = 0
    errors = 0

    for idx, row in df.iterrows():
        # Skip completely empty rows
        if pd.isna(row.get("ship_name")) and pd.isna(row.get("name_individual")):
            continue
        
        passenger_id = makePassengerID(
            row.get("naid"), 
            row.get("line_no"), 
            row.get("image_no")
        )
        
        dob_raw = row.get("date_of_birth")

        try:
            with transaction.atomic():
                # Create passenger data dictionary
                passenger_data = {
                    "naid": clean_value(row.get("naid")),
                    "ship_name": clean_value(row.get("ship_name")),
                    "departure_port": clean_value(row.get("departure_port")),
                    "arrival_port": clean_value(row.get("arrival_port")),
                    "arrival_date": safe_date(row.get("arrival_date")),
                    "passenger_class": clean_value(row.get("passenger_class")),
                    "image_no": clean_value(row.get("image_no")),
                    "line_no": clean_value(row.get("line_no")),
                    "name_individual": clean_value(row.get("name_individual")),
                    "name_family": clean_value(row.get("name_family")),
                    "name_tribal": clean_value(row.get("name_tribal")),
                    "chinese_signature": clean_value(row.get("chinese_signature")),
                    "sex": clean_value(row.get("sex")),
                    "pob_city_chinese": clean_value(row.get("pob_city_chinese")),
                    "pob_city_std": clean_value(row.get("pob_city_std")),
                    "pob_city_raw": clean_value(row.get("pob_city_raw")),
                    "pob_district_chinese": clean_value(row.get("pob_district_chinese")),
                    "pob_district_std": clean_value(row.get("pob_district_std")),
                    "pob_district_raw": clean_value(row.get("pob_district_raw")),
                    "pob_country": clean_value(row.get("pob_country")),
                    "date_of_birth": safe_date(dob_raw),
                    "date_of_birth_raw": str(dob_raw) if not pd.isna(dob_raw) else None,
                    "destination": clean_value(row.get("destination")),
                    "physical_markers": clean_value(row.get("physical_markers")),
                }
                
                passenger_obj, was_created = Passenger.objects.update_or_create(
                    passenger_id=passenger_id,
                    defaults=passenger_data,
                )
                
                if was_created:
                    created += 1
                else:
                    updated += 1

                # Clear existing related objects if updating
                if not was_created:
                    LaborerInfo.objects.filter(passenger=passenger_obj).delete()
                    MerchantInfo.objects.filter(passenger=passenger_obj).delete()
                    TransitInfo.objects.filter(passenger=passenger_obj).delete()
                    WifeChildInfo.objects.filter(passenger=passenger_obj).delete()
                    ExemptInfo.objects.filter(passenger=passenger_obj).delete()

                # LABORERS
                if has_data(
                    row.get("cert_residence_no"),
                    row.get("return_cert_no"),
                    row.get("us_residence_city"),
                    row.get("us_residence_state"),
                    row.get("departure_port_us"),
                    row.get("departure_date_us"),
                    row.get("claim_basis"),
                    row.get("overtime_certificate"),
                ):
                    LaborerInfo.objects.create(
                        passenger=passenger_obj,
                        cert_residence_no=clean_value(row.get("cert_residence_no")),
                        return_cert_no=clean_value(row.get("return_cert_no")),
                        us_residence_city=clean_value(row.get("us_residence_city")),
                        us_residence_state=clean_value(row.get("us_residence_state")),
                        departure_port_us=clean_value(row.get("departure_port_us")),
                        departure_date_us=safe_date(row.get("departure_date_us")),
                        claim_basis=clean_value(row.get("claim_basis")),
                        overtime_certificate=clean_value(row.get("overtime_certificate")),
                    )

                # MERCHANTS
                if has_data(
                    row.get("registered_cert_no"),
                    row.get("return_date_china"),
                    row.get("steamship_name"),
                    row.get("firm_name"),
                    row.get("firm_address"),
                    row.get("firm_city"),
                    row.get("members_count"),
                    row.get("years_member"),
                    row.get("capital_invested"),
                ):
                    members_count = None
                    if not pd.isna(row.get("members_count")):
                        try:
                            members_count = int(row.get("members_count"))
                        except Exception:
                            members_count = None

                    MerchantInfo.objects.create(
                        passenger=passenger_obj,
                        registered_cert_no=clean_value(row.get("registered_cert_no")),
                        return_date_china=safe_date(row.get("return_date_china")),
                        steamship_name=clean_value(row.get("steamship_name")),
                        firm_name=clean_value(row.get("firm_name")),
                        firm_address=clean_value(row.get("firm_address")),
                        firm_city=clean_value(row.get("firm_city")),
                        members_count=members_count,
                        years_member=clean_value(row.get("years_member")),
                        capital_invested=(
                            row.get("capital_invested")
                            if not pd.isna(row.get("capital_invested"))
                            else None
                        ),
                    )

                # TRANSITS
                if has_data(
                    row.get("cause_departure"),
                    row.get("us_residence"),
                    row.get("us_occupation"),
                    row.get("registered"),
                    row.get("registration_cert_no"),
                ):
                    TransitInfo.objects.create(
                        passenger=passenger_obj,
                        cause_departure=clean_value(row.get("cause_departure")),
                        us_residence=clean_value(row.get("us_residence")),
                        us_occupation=clean_value(row.get("us_occupation")),
                        registered=clean_value(row.get("registered")),
                        registration_cert_no=clean_value(row.get("registration_cert_no")),
                    )

                # WIFE/CHILD
                if has_data(
                    row.get("husband_or_father"),
                    row.get("residence_husband_father_address"),
                    row.get("residence_husband_father_state"),
                    row.get("witnesses"),
                    row.get("marriage_date"),
                    row.get("marriage_place"),
                    row.get("children_names"),
                    row.get("first_and_only_wife"),
                    row.get("mother_name"),
                    row.get("brothers_names"),
                    row.get("sisters_names"),
                ):
                    WifeChildInfo.objects.create(
                        passenger=passenger_obj,
                        husband_or_father=clean_value(row.get("husband_or_father")),
                        residence_husband_father_address=clean_value(row.get("residence_husband_father_address")),
                        residence_husband_father_state=clean_value(row.get("residence_husband_father_state")),
                        witnesses=clean_value(row.get("witnesses")),
                        marriage_date=safe_date(row.get("marriage_date")),
                        marriage_place=clean_value(row.get("marriage_place")),
                        children_names=clean_value(row.get("children_names")),
                        first_and_only_wife=clean_value(row.get("first_and_only_wife")),
                        mother_name=clean_value(row.get("mother_name")),
                        brothers_names=clean_value(row.get("brothers_names")),
                        sisters_names=clean_value(row.get("sisters_names")),
                    )

                # EXEMPTS
                if has_data(
                    row.get("official_title"),
                    row.get("last_occupation"),
                    row.get("occupation_place"),
                    row.get("intended_occupation"),
                    row.get("intended_residence"),
                    row.get("intended_duration"),
                    row.get("study_subject"),
                    row.get("school_name"),
                ):
                    ExemptInfo.objects.create(
                        passenger=passenger_obj,
                        official_title=clean_value(row.get("official_title")),
                        last_occupation=clean_value(row.get("last_occupation")),
                        occupation_place=clean_value(row.get("occupation_place")),
                        intended_occupation=clean_value(row.get("intended_occupation")),
                        intended_residence=clean_value(row.get("intended_residence")),
                        intended_duration=clean_value(row.get("intended_duration")),
                        study_subject=clean_value(row.get("study_subject")),
                        school_name=clean_value(row.get("school_name")),
                    )
                    
        except Exception as e:
            print(f"Error processing row {idx + 2} (Passenger ID: {passenger_id}): {e}")
            errors += 1
            continue
    
    print(f"\nImport finished!")
    print(f"Created: {created}")
    print(f"Updated: {updated}")
    print(f"Errors: {errors}")