import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
} from '@mui/material'
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Product Catalog
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Browse available products
      </Typography>

      {purchaseSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {purchaseSuccess}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Search by name or brand"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {!filteredProducts || filteredProducts.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">
            No products found.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brand || '-'}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
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
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenBuy(product)}
                      disabled={product.stock_status === 'Out of Stock'}
                    >
                      Buy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={buyOpen} onClose={() => setBuyOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Buy Product</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {selectedProduct?.name} {selectedProduct?.brand ? `(${selectedProduct.brand})` : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Price: ${selectedProduct?.price}
          </Typography>

          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value as string)}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          {paymentMethod === 'card' && (
            <>
              <TextField
                label="Card Number"
                fullWidth
                margin="dense"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
              />
              <TextField
                label="Expiry (MM/YY)"
                fullWidth
                margin="dense"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="12/30"
              />
              <TextField
                label="CVC"
                fullWidth
                margin="dense"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                placeholder="123"
              />
            </>
          )}

          {purchaseError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {purchaseError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyOpen(false)} disabled={purchaseMutation.isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmBuy}
            disabled={purchaseMutation.isLoading}
          >
            {purchaseMutation.isLoading ? 'Processing...' : 'Confirm Purchase'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CustomerCatalog
