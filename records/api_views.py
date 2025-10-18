from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.core.files.storage import default_storage
from django.db.models import Q, Count
from django.http import HttpResponse
import csv
from .models import (
    Passenger,
    LaborerInfo,
    MerchantInfo,
    TransitInfo,
    WifeChildInfo,
    ExemptInfo,
)

from .serializers import (
    PassengerSerializer,
    PassengerDetailSerializer,
)
class IsSuperUserOrReadOnly(BasePermission):
    """
    Custom permission:
    - Superusers can do anything
    - Regular users can only view and export
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user and request.user.is_authenticated
        
        # Write permissions only for superuser
        return request.user and request.user.is_superuser


class PassengerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing passengers with permission controls
    """
    queryset = Passenger.objects.all().select_related(
        'laborer_info', 'merchant_info', 'transit_info', 
        'wifechild_info', 'exempt_info'
    )
    serializer_class = PassengerSerializer
    permission_classes = [IsAuthenticated, IsSuperUserOrReadOnly]
    
    def get_permissions(self):
        """
        Set different permissions for different actions
        """
        if self.action in ['list', 'retrieve', 'statistics', 'export_csv']:
            # 临时允许任何人查看和导出（不需要登录）
            permission_classes = []  # 改成空列表！
        else:
            # 只有超级用户可以上传、创建、更新、删除
            permission_classes = [IsAuthenticated, IsSuperUserOrReadOnly]
        
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PassengerDetailSerializer
        return PassengerSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name_individual__icontains=search) |
                Q(name_family__icontains=search) |
                Q(ship_name__icontains=search) |
                Q(naid__icontains=search) |
                Q(passenger_id__icontains=search)
            )
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            categories = category.split(',')
            q = Q()
            for cat in categories:
                if cat == 'laborer':
                    q |= Q(laborer_info__isnull=False)
                elif cat == 'merchant':
                    q |= Q(merchant_info__isnull=False)
                elif cat == 'transit':
                    q |= Q(transit_info__isnull=False)
                elif cat == 'wifechild':
                    q |= Q(wifechild_info__isnull=False)
                elif cat == 'exempt':
                    q |= Q(exempt_info__isnull=False)
                elif cat == 'none':
                    q |= Q(
                        laborer_info__isnull=True,
                        merchant_info__isnull=True,
                        transit_info__isnull=True,
                        wifechild_info__isnull=True,
                        exempt_info__isnull=True
                    )
            if q:
                queryset = queryset.filter(q)
        
        # Other filters
        sex = self.request.query_params.get('sex', None)
        if sex:
            queryset = queryset.filter(sex=sex)
        
        arrival_port = self.request.query_params.get('arrival_port', None)
        if arrival_port:
            queryset = queryset.filter(arrival_port=arrival_port)
        
        pob_country = self.request.query_params.get('pob_country', None)
        if pob_country:
            queryset = queryset.filter(pob_country=pob_country)
        
        passenger_class = self.request.query_params.get('passenger_class', None)
        if passenger_class:
            queryset = queryset.filter(passenger_class=passenger_class)
        
        # Date range filtering
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(arrival_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(arrival_date__lte=end_date)
        
        return queryset.order_by('-arrival_date').distinct()
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_excel(self, request):
        """
        Upload and import Excel file - SUPERUSER ONLY
        """
        # Double check permission
        if not request.user.is_superuser:
            return Response(
                {'error': 'Only superusers can upload files'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        uploaded_file = request.FILES['file']
        
        # Validate file extension
        if not uploaded_file.name.endswith(('.xlsx', '.xls')):
            return Response(
                {'error': 'File must be an Excel file (.xlsx or .xls)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save file temporarily
        file_path = default_storage.save(f'tmp/{uploaded_file.name}', uploaded_file)
        full_path = default_storage.path(file_path)
        
        try:
            # Import the data
            from records.import_data import run
            run(full_path)
            
            # Clean up temporary file
            default_storage.delete(file_path)
            
            return Response({
                'message': 'File uploaded and processed successfully',
                'filename': uploaded_file.name
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Clean up on error
            if default_storage.exists(file_path):
                default_storage.delete(file_path)
            
            return Response(
                {'error': f'Error processing file: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get database statistics - ALL AUTHENTICATED USERS
        """
        total_passengers = Passenger.objects.count()
        
        stats = {
            'total_passengers': total_passengers,
            'by_category': {
                'laborer': Passenger.objects.filter(laborer_info__isnull=False).count(),
                'merchant': Passenger.objects.filter(merchant_info__isnull=False).count(),
                'transit': Passenger.objects.filter(transit_info__isnull=False).count(),
                'wifechild': Passenger.objects.filter(wifechild_info__isnull=False).count(),
                'exempt': Passenger.objects.filter(exempt_info__isnull=False).count(),
                'uncategorized': Passenger.objects.filter(
                    laborer_info__isnull=True,
                    merchant_info__isnull=True,
                    transit_info__isnull=True,
                    wifechild_info__isnull=True,
                    exempt_info__isnull=True
                ).count(),
            },
            'by_sex': dict(
                Passenger.objects.values('sex').annotate(count=Count('id')).values_list('sex', 'count')
            ),
            'by_arrival_port': dict(
                Passenger.objects.values('arrival_port').annotate(count=Count('id')).values_list('arrival_port', 'count')
            ),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export filtered passengers to CSV with ALL fields including all related data
        """
        from django.http import HttpResponse
        import csv
        
        queryset = self.get_queryset().select_related(
            'laborer_info', 'merchant_info', 'transit_info', 
            'wifechild_info', 'exempt_info'
        )
        
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="passengers_complete_export.csv"'
        
        writer = csv.writer(response)
        
        # Define ALL headers - Basic + All Related Tables
        headers = [
            # Basic Passenger Information
            'Passenger ID', 'NAID', 'Ship Name', 'Departure Port', 'Arrival Port', 
            'Arrival Date', 'Passenger Class', 'Image No', 'Line No',
            
            # Name Information
            'Individual Name', 'Family Name', 'Tribal Name', 'Chinese Signature',
            
            # Demographics
            'Sex', 'Date of Birth', 'Date of Birth (Raw)',
            
            # Place of Birth
            'POB City (Chinese)', 'POB City (Standardized)', 'POB City (Raw)',
            'POB District (Chinese)', 'POB District (Standardized)', 'POB District (Raw)',
            'POB Country',
            
            # Other Basic Info
            'Destination', 'Physical Markers',
            
            # LABORER INFO
            'Laborer: Certificate of Residence No', 'Laborer: Return Certificate No',
            'Laborer: US Residence City', 'Laborer: US Residence State',
            'Laborer: Departure Port (US)', 'Laborer: Departure Date (US)',
            'Laborer: Claim Basis', 'Laborer: Overtime Certificate',
            
            # MERCHANT INFO
            'Merchant: Registered Certificate No', 'Merchant: Return Date to China',
            'Merchant: Steamship Name', 'Merchant: Firm Name', 'Merchant: Firm Address',
            'Merchant: Firm City', 'Merchant: Members Count', 'Merchant: Years as Member',
            'Merchant: Capital Invested',
            
            # TRANSIT INFO
            'Transit: Cause of Departure', 'Transit: US Residence', 'Transit: US Occupation',
            'Transit: Registered', 'Transit: Registration Certificate No',
            
            # WIFE/CHILD INFO
            'Wife/Child: Husband or Father Name', 'Wife/Child: Residence Address',
            'Wife/Child: Residence State', 'Wife/Child: Witnesses',
            'Wife/Child: Marriage Date', 'Wife/Child: Marriage Place',
            'Wife/Child: Children Names', 'Wife/Child: First and Only Wife',
            'Wife/Child: Mother Name', 'Wife/Child: Brothers Names', 'Wife/Child: Sisters Names',
            
            # EXEMPT INFO
            'Exempt: Official Title', 'Exempt: Last Occupation', 'Exempt: Occupation Place',
            'Exempt: Intended Occupation', 'Exempt: Intended Residence',
            'Exempt: Intended Duration', 'Exempt: Study Subject', 'Exempt: School Name',
        ]
        
        writer.writerow(headers)
        
        # Write data rows with ALL fields
        for p in queryset:
            row = [
                # Basic Passenger Information
                p.passenger_id or '',
                p.naid or '',
                p.ship_name or '',
                p.departure_port or '',
                p.arrival_port or '',
                p.arrival_date.strftime('%Y-%m-%d') if p.arrival_date else '',
                p.passenger_class or '',
                p.image_no or '',
                p.line_no or '',
                
                # Name Information
                p.name_individual or '',
                p.name_family or '',
                p.name_tribal or '',
                p.chinese_signature or '',
                
                # Demographics
                p.sex or '',
                p.date_of_birth.strftime('%Y-%m-%d') if p.date_of_birth else '',
                p.date_of_birth_raw or '',
                
                # Place of Birth
                p.pob_city_chinese or '',
                p.pob_city_std or '',
                p.pob_city_raw or '',
                p.pob_district_chinese or '',
                p.pob_district_std or '',
                p.pob_district_raw or '',
                p.pob_country or '',
                
                # Other Basic Info
                p.destination or '',
                p.physical_markers or '',
            ]
            
            # LABORER INFO
            if hasattr(p, 'laborer_info') and p.laborer_info:
                lab = p.laborer_info
                row.extend([
                    lab.cert_residence_no or '',
                    lab.return_cert_no or '',
                    lab.us_residence_city or '',
                    lab.us_residence_state or '',
                    lab.departure_port_us or '',
                    lab.departure_date_us.strftime('%Y-%m-%d') if lab.departure_date_us else '',
                    lab.claim_basis or '',
                    lab.overtime_certificate or '',
                ])
            else:
                row.extend([''] * 8)  # 8 empty fields for laborer info
            
            # MERCHANT INFO
            if hasattr(p, 'merchant_info') and p.merchant_info:
                mer = p.merchant_info
                row.extend([
                    mer.registered_cert_no or '',
                    mer.return_date_china.strftime('%Y-%m-%d') if mer.return_date_china else '',
                    mer.steamship_name or '',
                    mer.firm_name or '',
                    mer.firm_address or '',
                    mer.firm_city or '',
                    str(mer.members_count) if mer.members_count is not None else '',
                    mer.years_member or '',
                    str(mer.capital_invested) if mer.capital_invested is not None else '',
                ])
            else:
                row.extend([''] * 9)  # 9 empty fields for merchant info
            
            # TRANSIT INFO
            if hasattr(p, 'transit_info') and p.transit_info:
                tra = p.transit_info
                row.extend([
                    tra.cause_departure or '',
                    tra.us_residence or '',
                    tra.us_occupation or '',
                    tra.registered or '',
                    tra.registration_cert_no or '',
                ])
            else:
                row.extend([''] * 5)  # 5 empty fields for transit info
            
            # WIFE/CHILD INFO
            if hasattr(p, 'wifechild_info') and p.wifechild_info:
                wc = p.wifechild_info
                row.extend([
                    wc.husband_or_father or '',
                    wc.residence_husband_father_address or '',
                    wc.residence_husband_father_state or '',
                    wc.witnesses or '',
                    wc.marriage_date.strftime('%Y-%m-%d') if wc.marriage_date else '',
                    wc.marriage_place or '',
                    wc.children_names or '',
                    wc.first_and_only_wife or '',
                    wc.mother_name or '',
                    wc.brothers_names or '',
                    wc.sisters_names or '',
                ])
            else:
                row.extend([''] * 11)  # 11 empty fields for wife/child info
            
            # EXEMPT INFO
            if hasattr(p, 'exempt_info') and p.exempt_info:
                ex = p.exempt_info
                row.extend([
                    ex.official_title or '',
                    ex.last_occupation or '',
                    ex.occupation_place or '',
                    ex.intended_occupation or '',
                    ex.intended_residence or '',
                    ex.intended_duration or '',
                    ex.study_subject or '',
                    ex.school_name or '',
                ])
            else:
                row.extend([''] * 8)  # 8 empty fields for exempt info
            
            writer.writerow(row)
        
        return response