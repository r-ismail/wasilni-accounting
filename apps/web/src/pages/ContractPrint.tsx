import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Button, Paper, Grid, Divider, Alert } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

export default function ContractPrint() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const { id } = useParams();
  const formatCurrencyEn = (value?: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
  const formatDateEn = (value: string | Date) => new Date(value).toLocaleDateString('en-GB');

  const { data: company } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      const res = await api.get('/companies/my-company');
      return res.data.data || res.data;
    },
  });

  const { data: contractData, isLoading } = useQuery({
    queryKey: ['contract', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get(`/contracts/${id}`);
      return res.data.data;
    },
  });

  const contract = contractData;

  const handlePrint = () => window.print();

  if (isLoading) {
    return <Typography>{t('common.loading')}</Typography>;
  }

  if (!contract) {
    return <Alert severity="warning">{t('common.noData')}</Alert>;
  }

  return (
    <Box>
      <style>
        {`@media print {
          @page { size: A4; margin: 12mm; }
          .print-hidden { display: none !important; }
          .MuiDrawer-root, .MuiAppBar-root { display: none !important; }
          html, body { width: 100% !important; margin: 0 !important; padding: 0 !important; background: #fff !important; }
          #root { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          main { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          #root > .MuiBox-root { display: block !important; width: 100% !important; margin: 0 !important; }
        }`}
      </style>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">{t('contracts.printTitle')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('contracts.contractNumber')}: {contract._id}
          </Typography>
        </Box>
        <Box className="print-hidden" sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/contracts')}>
            {t('contracts.backToContracts')}
          </Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
            {t('contracts.print')}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {company?.logo ? (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={company.logo}
                alt={company?.name || t('app.title')}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </Box>
          ) : null}
          <Box>
            <Typography variant="h6" gutterBottom>
              {company?.name || t('app.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {company?.address || '-'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {company?.phone || '-'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {isArabic ? (
          <>
            <Typography variant="h5" gutterBottom align="center">
              عقد إيجار شقة سكنية
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
          تم بعون الله تعالى في يوم: ({formatDateEn(new Date())}) الموافق:
              ({formatDateEn(new Date())})
          </Typography>
            <Typography variant="body1" paragraph>
              أولاً: أطراف العقد
            </Typography>
            <Typography variant="body1" paragraph>
              الطرف الأول (المؤجر): الاسم: {company?.name || '-'}، العنوان: {company?.address || '-'}،
              الهاتف: {company?.phone || '-'}.
            </Typography>
            <Typography variant="body1" paragraph>
              الطرف الثاني (المستأجر): الاسم: {contract.customerId?.name || '-'}، العنوان:
              {contract.customerId?.address || '-'}، رقم البطاقة/جواز السفر:
              {contract.customerId?.idNumber || '-'}.
            </Typography>
            <Typography variant="body1" paragraph>
              وقد أقر الطرفان بأهليتهما الشرعية والقانونية للتعاقد، واتفقا على ما يلي:
            </Typography>
            <Typography variant="body1" paragraph>
              ثانياً: وصف العين المؤجرة
            </Typography>
            <Typography variant="body1" paragraph>
              قام الطرف الأول بتأجير الطرف الثاني الشقة السكنية الكائنة في: المبنى
              {contract.unitId?.buildingId?.name || '-'}، رقم الشقة {contract.unitId?.unitNumber || '-'}.
            </Typography>
            <Typography variant="body1" paragraph>
              ثالثاً: مدة الإيجار
            </Typography>
            <Typography variant="body1" paragraph>
          تبدأ من {formatDateEn(contract.startDate)} وتنتهي في
              {formatDateEn(contract.endDate)} قابلة للتجديد بموافقة الطرفين كتابةً.
          </Typography>
            <Typography variant="body1" paragraph>
              رابعاً: قيمة الإيجار وطريقة السداد
            </Typography>
            <Typography variant="body1" paragraph>
          قيمة الإيجار المتفق عليها: {formatCurrencyEn(contract.baseRentAmount)} ريال يمني.
          </Typography>
            <Typography variant="body1" paragraph>
              خامساً: التزامات الطرف الأول (المؤجر)
            </Typography>
            <Typography variant="body1" paragraph>
              تسليم الشقة صالحة للسكن، وإجراء الصيانة الأساسية غير الناتجة عن سوء استعمال.
            </Typography>
            <Typography variant="body1" paragraph>
              سادساً: التزامات الطرف الثاني (المستأجر)
            </Typography>
            <Typography variant="body1" paragraph>
              استخدام الشقة للسكن فقط، والمحافظة عليها، وعدم التأجير من الباطن إلا بموافقة خطية.
            </Typography>
            <Typography variant="body1" paragraph>
              سابعاً: فسخ العقد
            </Typography>
            <Typography variant="body1" paragraph>
              يحق لأي طرف فسخ العقد في حال إخلال الطرف الآخر ببنوده بعد إشعاره كتابياً ومنحه مهلة معقولة.
            </Typography>
            <Typography variant="body1" paragraph>
              ثامناً: أحكام عامة
            </Typography>
            <Typography variant="body1" paragraph>
              يخضع هذا العقد لأحكام القوانين النافذة في الجمهورية اليمنية.
            </Typography>
            <Typography variant="body1" paragraph>
              توقيع الطرفين
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  الطرف الأول (المؤجر)
                </Typography>
                <Typography>{company?.name || '-'}</Typography>
                <Typography>التوقيع: ____________________</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  الطرف الثاني (المستأجر)
                </Typography>
                <Typography>{contract.customerId?.name || '-'}</Typography>
                <Typography>التوقيع: ____________________</Typography>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Typography variant="h5" gutterBottom align="center">
              Residential Apartment Lease Agreement
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              This agreement is made on ({formatDateEn(new Date())}).
            </Typography>
            <Typography variant="body1" paragraph>
              First: Parties
            </Typography>
            <Typography variant="body1" paragraph>
              Landlord: {company?.name || '-'}, Address: {company?.address || '-'}, Phone:{' '}
              {company?.phone || '-'}.
            </Typography>
            <Typography variant="body1" paragraph>
              Tenant: {contract.customerId?.name || '-'}, Address: {contract.customerId?.address || '-'},
              ID/Passport: {contract.customerId?.idNumber || '-'}.
            </Typography>
            <Typography variant="body1" paragraph>
              Both parties acknowledge their legal capacity and agree as follows:
            </Typography>
            <Typography variant="body1" paragraph>
              Second: Property Description
            </Typography>
            <Typography variant="body1" paragraph>
              The leased apartment is located at building {contract.unitId?.buildingId?.name || '-'}, unit{' '}
              {contract.unitId?.unitNumber || '-'}.
            </Typography>
            <Typography variant="body1" paragraph>
              Third: Lease Term
            </Typography>
            <Typography variant="body1" paragraph>
              From {formatDateEn(contract.startDate)} to {formatDateEn(contract.endDate)}, renewable by mutual written consent.
            </Typography>
            <Typography variant="body1" paragraph>
              Fourth: Rent & Payment
            </Typography>
            <Typography variant="body1" paragraph>
              Rent amount: {formatCurrencyEn(contract.baseRentAmount)} YER.
            </Typography>
            <Typography variant="body1" paragraph>
              Fifth: Landlord Obligations
            </Typography>
            <Typography variant="body1" paragraph>
              Provide a habitable unit and perform essential maintenance.
            </Typography>
            <Typography variant="body1" paragraph>
              Sixth: Tenant Obligations
            </Typography>
            <Typography variant="body1" paragraph>
              Residential use only, maintain the unit, no sublease without written consent.
            </Typography>
            <Typography variant="body1" paragraph>
              Seventh: Termination
            </Typography>
            <Typography variant="body1" paragraph>
              Either party may terminate upon breach with written notice and a reasonable cure period.
            </Typography>
            <Typography variant="body1" paragraph>
              Eighth: General Terms
            </Typography>
            <Typography variant="body1" paragraph>
              This contract is governed by the laws of the Republic of Yemen.
            </Typography>
            <Typography variant="body1" paragraph>
              Signatures
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Landlord
                </Typography>
                <Typography>{company?.name || '-'}</Typography>
                <Typography>Signature: ____________________</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Tenant
                </Typography>
                <Typography>{contract.customerId?.name || '-'}</Typography>
                <Typography>Signature: ____________________</Typography>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Box>
  );
}
