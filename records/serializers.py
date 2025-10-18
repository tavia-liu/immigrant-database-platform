from rest_framework import serializers
from .models import (
    Passenger, LaborerInfo, MerchantInfo, 
    TransitInfo, WifeChildInfo, ExemptInfo
)


class LaborerInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LaborerInfo
        exclude = ['id', 'passenger']


class MerchantInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MerchantInfo
        exclude = ['id', 'passenger']


class TransitInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransitInfo
        exclude = ['id', 'passenger']


class WifeChildInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = WifeChildInfo
        exclude = ['id', 'passenger']


class ExemptInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExemptInfo
        exclude = ['id', 'passenger']


class PassengerSerializer(serializers.ModelSerializer):
    """Basic serializer for list views"""
    full_name = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()
    
    class Meta:
        model = Passenger
        fields = [
            'id', 'passenger_id', 'naid', 'full_name', 'ship_name',
            'arrival_port', 'arrival_date', 'sex', 'passenger_class',
            'categories', 'destination'
        ]
    
    def get_full_name(self, obj):
        parts = []
        if obj.name_individual:
            parts.append(obj.name_individual)
        if obj.name_family:
            parts.append(obj.name_family)
        return ' '.join(parts) if parts else 'Unknown'
    
    def get_categories(self, obj):
        categories = []
        if hasattr(obj, 'laborer_info') and obj.laborer_info:
            categories.append('laborer')
        if hasattr(obj, 'merchant_info') and obj.merchant_info:
            categories.append('merchant')
        if hasattr(obj, 'transit_info') and obj.transit_info:
            categories.append('transit')
        if hasattr(obj, 'wifechild_info') and obj.wifechild_info:
            categories.append('wifechild')
        if hasattr(obj, 'exempt_info') and obj.exempt_info:
            categories.append('exempt')
        return categories


class PassengerDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with all related info"""
    laborer_info = LaborerInfoSerializer(read_only=True)
    merchant_info = MerchantInfoSerializer(read_only=True)
    transit_info = TransitInfoSerializer(read_only=True)
    wifechild_info = WifeChildInfoSerializer(read_only=True)
    exempt_info = ExemptInfoSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Passenger
        fields = '__all__'
    
    def get_full_name(self, obj):
        parts = []
        if obj.name_individual:
            parts.append(obj.name_individual)
        if obj.name_family:
            parts.append(obj.name_family)
        return ' '.join(parts) if parts else 'Unknown'