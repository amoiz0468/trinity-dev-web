import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Rating,
  InputAdornment,
} from '@mui/material'
import { ShoppingCart, Search } from 'lucide-react'
import { invoiceService, productService } from '../services'

const CustomerCatalog = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [buyOpen, setBuyOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [purchaseError, setPurchaseError] = useState('')
  const [purchaseSuccess, setPurchaseSuccess] = useState('')
  const { data, isLoading, error } = useQuery('customer-products', productService.getAll, {
    retry: 1,
  })

  const allProducts = Array.isArray(data) ? data : (data?.results || [])

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return allProducts
    const term = searchTerm.toLowerCase()
    return allProducts.filter((product: any) => {
      return (
        product.name.toLowerCase().includes(term) ||
        (product.brand || '').toLowerCase().includes(term)
      )
    })
  }, [allProducts, searchTerm])

  const purchaseMutation = useMutation(invoiceService.create, {
    onSuccess: () => {
      setBuyOpen(false)
      setSelectedProduct(null)
      setQuantity('1')
      setPaymentMethod('card')
      setPurchaseError('')
      setPurchaseSuccess('Invoice created. You can view it in My Orders.')
      queryClient.invalidateQueries('customer-invoices')
      queryClient.invalidateQueries('customer-products')
    },
    onError: () => {
      setPurchaseError('Failed to create invoice. Please try again.')
      setPurchaseSuccess('')
    },
  })

  const handleOpenBuy = (product: any) => {
    setSelectedProduct(product)
    setQuantity('1')
    setPaymentMethod('card')
    setCardNumber('')
    setCardExpiry('')
    setCardCvc('')
    setPurchaseError('')
    setPurchaseSuccess('')
    setBuyOpen(true)
  }

  const handleConfirmBuy = () => {
    if (!selectedProduct) return
    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      setPurchaseError('Please enter a valid quantity.')
      return
    }
    if (selectedProduct.quantity_in_stock !== undefined && qty > selectedProduct.quantity_in_stock) {
      setPurchaseError('Quantity exceeds available stock.')
      return
    }
    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvc)) {
      setPurchaseError('Please enter card number, expiry, and CVC.')
      return
    }

    let notes: string | undefined
    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(/\D/g, '')
      const last4 = digits.slice(-4) || '0000'
      notes = `Card payment (**** ${last4}), exp ${cardExpiry}`
    }
    const payload = {
      payment_method: paymentMethod,
      notes,
      items: [
        {
          product: selectedProduct.id,
          quantity: qty,
          unit_price: Number(selectedProduct.price),
        },
      ],
    }
    purchaseMutation.mutate(payload)
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Catalog
        </Typography>
        <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
          <Typography color="error">
            Failed to load products. Please try again later.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a' }}>
          Product Catalog
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Discover our wide range of quality products
        </Typography>
      </Box>

      {purchaseSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {purchaseSuccess}
        </Alert>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search by product name or brand..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="#999" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Paper sx={{ p: 3, bgcolor: '#ffebee', borderRadius: 2 }}>
          <Typography color="error">
            Failed to load products. Please try again later.
          </Typography>
        </Paper>
      )}

      {!isLoading && !error && (!filteredProducts || filteredProducts.length === 0) && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary" variant="h6">
            No products found. Try adjusting your search.
          </Typography>
        </Paper>
      )}

      {!isLoading && !error && filteredProducts && filteredProducts.length > 0 && (
        <Grid container spacing={3}>
          {filteredProducts.map((product: any) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                {/* Product Image */}
                <CardMedia
                  component="div"
                  sx={{
                    height: 250,
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {product.picture_url ? (
                    <img
                      src={product.picture_url}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#e0e0e0',
                      }}
                    >
                      <Typography color="text.secondary">No Image</Typography>
                    </Box>
                  )}
                  {/* Stock Status Badge */}
                  <Chip
                    label={product.stock_status}
                    color={
                      product.stock_status === 'In Stock'
                        ? 'success'
                        : product.stock_status === 'Low Stock'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontWeight: 600,
                    }}
                  />
                </CardMedia>

                {/* Product Content */}
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  {/* Brand */}
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5 }}
                  >
                    {product.brand || 'Brand'}
                  </Typography>

                  {/* Product Name */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      minHeight: '2.5rem',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {product.name}
                  </Typography>

                  {/* Rating */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating value={4} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      (4.0)
                    </Typography>
                  </Box>

                  {/* Price Section */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: '#1976d2' }}
                    >
                      ${product.price}
                    </Typography>
                    {product.original_price && (
                      <Typography
                        sx={{
                          textDecoration: 'line-through',
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                        }}
                      >
                        ${product.original_price}
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                {/* Buy Button */}
                <CardActions sx={{ pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCart size={18} />}
                    onClick={() => handleOpenBuy(product)}
                    disabled={product.stock_status === 'Out of Stock'}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontWeight: 600,
                      py: 1.2,
                      borderRadius: 1,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6b3a8e 100%)',
                      },
                    }}
                  >
                    {product.stock_status === 'Out of Stock' ? 'Out of Stock' : 'Buy Now'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={buyOpen} onClose={() => setBuyOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 700, bgcolor: '#f5f5f5' }}>
          Complete Your Purchase
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Product Summary */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#f9f9f9',
              borderRadius: 2,
              mb: 3,
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {selectedProduct?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {selectedProduct?.brand ? `Brand: ${selectedProduct.brand}` : 'Brand: N/A'}
            </Typography>
            <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
              Price: ${selectedProduct?.price}
            </Typography>
          </Box>

          {/* Quantity Input */}
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ mb: 2 }}
            variant="outlined"
          />

          {/* Total Price */}
          <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1">Total Price:</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                ${(Number(selectedProduct?.price) * Number(quantity)).toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Payment Method */}
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value as string)}
            >
              <MenuItem value="cash">💵 Cash</MenuItem>
              <MenuItem value="card">💳 Card</MenuItem>
              <MenuItem value="paypal">🅿️ PayPal</MenuItem>
              <MenuItem value="other">📱 Other</MenuItem>
            </Select>
          </FormControl>

          {/* Card Details */}
          {paymentMethod === 'card' && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Card Details
              </Typography>
              <TextField
                label="Card Number"
                fullWidth
                margin="dense"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                <TextField
                  label="Expiry (MM/YY)"
                  margin="dense"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="12/30"
                />
                <TextField
                  label="CVC"
                  margin="dense"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder="123"
                />
              </Box>
            </Box>
          )}

          {/* Error Message */}
          {purchaseError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {purchaseError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setBuyOpen(false)} disabled={purchaseMutation.isLoading} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmBuy}
            disabled={purchaseMutation.isLoading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 600,
              px: 3,
            }}
          >
            {purchaseMutation.isLoading ? 'Processing...' : 'Confirm Purchase'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CustomerCatalog
