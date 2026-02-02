import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, LocalShipping } from '@mui/icons-material';
import { adminAPI } from '../../services/api';
import { useSnackbar } from 'notistack';

const AdminPricing = () => {
  const [rules, setRules] = useState([]);
  const [dialog, setDialog] = useState({ open: false, mode: 'create', data: null });
  const [formData, setFormData] = useState({
    ruleType: 'delivery',
    zone: 'Z1',
    zoneName: '',
    customerPrice: 0,
    shopCost: 0,
    platformMargin: 0,
    estimatedTime: '',
    isActive: true,
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await adminAPI.getPricingRules();
      setRules(response.data.data);
    } catch (err) {
      console.error('Error fetching pricing rules:', err);
      enqueueSnackbar('حدث خطأ في تحميل قواعد التسعير', { variant: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      if (dialog.mode === 'create') {
        await adminAPI.createPricingRule(formData);
        enqueueSnackbar('تم إنشاء قاعدة التسعير بنجاح', { variant: 'success' });
      } else {
        await adminAPI.updatePricingRule(dialog.data._id, formData);
        enqueueSnackbar('تم تحديث قاعدة التسعير بنجاح', { variant: 'success' });
      }
      closeDialog();
      fetchRules();
    } catch (err) {
      enqueueSnackbar('حدث خطأ في حفظ قاعدة التسعير', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه القاعدة؟')) {
      try {
        await adminAPI.deletePricingRule(id);
        enqueueSnackbar('تم تعطيل قاعدة التسعير', { variant: 'info' });
        fetchRules();
      } catch (err) {
        enqueueSnackbar('حدث خطأ في حذف قاعدة التسعير', { variant: 'error' });
      }
    }
  };

  const openCreateDialog = () => {
    setFormData({
      ruleType: 'delivery',
      zone: 'Z1',
      zoneName: '',
      customerPrice: 0,
      shopCost: 0,
      platformMargin: 0,
      estimatedTime: '',
      isActive: true,
    });
    setDialog({ open: true, mode: 'create', data: null });
  };

  const openEditDialog = (rule) => {
    setFormData({
      ruleType: rule.ruleType,
      zone: rule.zone,
      zoneName: rule.zoneName,
      customerPrice: rule.customerPrice,
      shopCost: rule.shopCost,
      platformMargin: rule.platformMargin,
      estimatedTime: rule.estimatedTime,
      isActive: rule.isActive,
    });
    setDialog({ open: true, mode: 'edit', data: rule });
  };

  const closeDialog = () => {
    setDialog({ open: false, mode: 'create', data: null });
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const zones = [
    { value: 'Z1', label: 'المنطقة 1 - دبي (المركز)' },
    { value: 'Z2', label: 'المنطقة 2 - دبي (الضواحي)' },
    { value: 'Z3', label: 'المنطقة 3 - الشارقة' },
    { value: 'Z4', label: 'المنطقة 4 - مناطق أخرى' },
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontFamily: '"Noto Naskh Arabic", serif',
              fontWeight: 700,
              color: 'primary.main',
              mb: 1,
            }}
          >
            إدارة التسعير
          </Typography>
          <Typography variant="body1" color="text.secondary">
            تحديد أسعار التوصيل والهوامش
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreateDialog}
          sx={{
            py: 1.5,
            px: 3,
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          إضافة قاعدة جديدة
        </Button>
      </Box>

      {/* Pricing Rules Table */}
      <Card
        sx={{
          borderRadius: 3,
          border: '2px solid',
          borderColor: 'rgba(184, 149, 106, 0.2)',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'background.paper' }}>
                  <TableCell sx={{ fontWeight: 700 }}>النوع</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>المنطقة</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>اسم المنطقة</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>سعر العميل</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>تكلفة المحل</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>هامش المنصة</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>الوقت المتوقع</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        لا توجد قواعد تسعير. أضف قاعدة جديدة للبدء.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow
                      key={rule._id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(184, 149, 106, 0.05)',
                        },
                      }}
                    >
                      <TableCell>
                        <Chip
                          icon={<LocalShipping />}
                          label={rule.ruleType === 'delivery' ? 'توصيل' : 'عنصر'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {rule.zone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{rule.zoneName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {rule.customerPrice} درهم
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{rule.shopCost} درهم</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                          {rule.platformMargin} درهم
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{rule.estimatedTime || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rule.isActive ? 'نشط' : 'معطل'}
                          color={rule.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="تعديل">
                            <IconButton
                              size="small"
                              sx={{ color: 'primary.main' }}
                              onClick={() => openEditDialog(rule)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton
                              size="small"
                              sx={{ color: 'error.main' }}
                              onClick={() => handleDelete(rule._id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialog.open}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '2px solid',
            borderColor: 'accent.main',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Noto Naskh Arabic", serif',
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'primary.main',
          }}
        >
          {dialog.mode === 'create' ? 'إضافة قاعدة تسعير جديدة' : 'تعديل قاعدة التسعير'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="نوع القاعدة"
                  value={formData.ruleType}
                  onChange={(e) => handleChange('ruleType', e.target.value)}
                >
                  <MenuItem value="delivery">توصيل</MenuItem>
                  <MenuItem value="item">عنصر</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="المنطقة"
                  value={formData.zone}
                  onChange={(e) => handleChange('zone', e.target.value)}
                >
                  {zones.map((zone) => (
                    <MenuItem key={zone.value} value={zone.value}>
                      {zone.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="اسم المنطقة"
                  value={formData.zoneName}
                  onChange={(e) => handleChange('zoneName', e.target.value)}
                  placeholder="مثال: دبي المركز"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="سعر العميل (درهم)"
                  value={formData.customerPrice}
                  onChange={(e) => handleChange('customerPrice', parseFloat(e.target.value))}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="تكلفة المحل (درهم)"
                  value={formData.shopCost}
                  onChange={(e) => handleChange('shopCost', parseFloat(e.target.value))}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="هامش المنصة (درهم)"
                  value={formData.platformMargin}
                  onChange={(e) => handleChange('platformMargin', parseFloat(e.target.value))}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="الوقت المتوقع"
                  value={formData.estimatedTime}
                  onChange={(e) => handleChange('estimatedTime', e.target.value)}
                  placeholder="مثال: 2-3 أيام"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                      color="success"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formData.isActive ? 'نشط' : 'معطل'}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={closeDialog} sx={{ fontWeight: 600 }}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={handleSave} sx={{ fontWeight: 600 }}>
            {dialog.mode === 'create' ? 'إضافة' : 'حفظ التعديلات'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPricing;
