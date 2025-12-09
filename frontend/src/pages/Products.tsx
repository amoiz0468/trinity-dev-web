import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material'
import { QrCode2 as BarcodeIcon, Edit as EditIcon } from '@mui/icons-material'
import { productService } from '../services'
import { useState } from 'react'

const Products = () => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    brand: '',
    price: '',
    quantity_in_stock: '',
    barcode: '',
  })
  const [formError, setFormError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStock, setFilterStock] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')
  const [useBarcode, setUseBarcode] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const { data, isLoading, error } = useQuery('products', productService.getAll, {
    retry: 1,
  })

  // Handle paginated responses or direct array
  const allProducts = Array.isArray(data) ? data : (data?.results || [])

  // Apply client-side filtering
  const products = allProducts.filter((product: any) => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStock = filterStock === 'all' ||
      (filterStock === 'in-stock' && product.stock_status === 'In Stock') ||
      (filterStock === 'low-stock' && product.stock_status === 'Low Stock') ||
      (filterStock === 'out-of-stock' && product.stock_status === 'Out of Stock')
    
    return matchesSearch && matchesStock
  })

  const createMutation = useMutation(productService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('products')
      setOpen(false)
      setForm({ name: '', brand: '', price: '', quantity_in_stock: '', barcode: '' })
      setFormError('')
      setUseBarcode(false)
    },
    onError: () => {
      setFormError('Failed to create product. Please try again.')
    },
  })

  const handleSyncBarcode = async () => {
    if (!form.barcode) {
      setFormError('Please enter a barcode')
      return
    }

    setSyncing(true)
    setFormError('')

    try {
      const result = await productService.syncOpenFoodFacts(form.barcode)
      // Auto-fill form with synced data
      setForm({
        ...form,
        name: result.product.name || '',
        brand: result.product.brand || '',
        price: result.product.price?.toString() || '',
      })
      setFormError('')
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to sync with Open Food Facts. Try manual entry.')
    } finally {
      setSyncing(false)
    }
  }

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.quantity_in_stock) {
      setFormError('Name, price, and stock are required.')
      return
    }

    const payload = {
      name: form.name,
      brand: form.brand || undefined,
      price: Number(form.price),
      quantity_in_stock: Number(form.quantity_in_stock),
    }

    createMutation.mutate(payload)
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
          Products
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
        Products
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your product inventory
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search by name or brand"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Stock</InputLabel>
              <Select
                value={filterStock}
                label="Filter by Stock"
                onChange={(e) => setFilterStock(e.target.value as any)}
              >
                <MenuItem value="all">All Products</MenuItem>
                <MenuItem value="in-stock">In Stock</MenuItem>
                <MenuItem value="low-stock">Low Stock</MenuItem>
                <MenuItem value="out-of-stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={5} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Add Product
            </Button>
          </Grid>
        </Grid>
      </Box>

      {!products || products.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">
            {searchTerm || filterStock !== 'all' 
              ? 'No products match your filters. Try adjusting the search or filter.'
              : 'No products found. Use "Add Product" to create one.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brand || '-'}</TableCell>
                  <TableCell>{product.category_name || '-'}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.quantity_in_stock}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
              value={useBarcode ? 'barcode' : 'manual'}
              exclusive
              onChange={(_, value) => {
                if (value !== null) {
                  setUseBarcode(value === 'barcode')
                  setFormError('')
                }
              }}
              fullWidth
              size="small"
            >
              <ToggleButton value="manual">
                <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                Manual Entry
              </ToggleButton>
              <ToggleButton value="barcode">
                <BarcodeIcon sx={{ mr: 1, fontSize: 18 }} />
                Scan Barcode
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {useBarcode ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter a product barcode to automatically fetch details from Open Food Facts
              </Typography>
              <TextField
                label="Barcode"
                fullWidth
                margin="dense"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                placeholder="e.g., 3017620422003"
                helperText="Enter barcode and click 'Fetch Data'"
              />
              <Button
                variant="outlined"
                fullWidth
                onClick={handleSyncBarcode}
                disabled={syncing || !form.barcode}
                sx={{ mt: 1, mb: 2 }}
              >
                {syncing ? 'Fetching...' : 'Fetch Data from Open Food Facts'}
              </Button>
              
              {(form.name || form.brand) && (
                <>
                  <Divider sx={{ my: 2 }}>Auto-filled Information</Divider>
                  <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                    ✓ Product data fetched successfully!
                  </Typography>
                </>
              )}
            </>
          ) : null}

          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            disabled={useBarcode && syncing}
          />
          <TextField
            label="Brand"
            fullWidth
            margin="dense"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            disabled={useBarcode && syncing}
          />
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="dense"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <TextField
            label="Quantity in Stock"
            type="number"
            fullWidth
            margin="dense"
            value={form.quantity_in_stock}
            onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
            required
          />
          {formError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {formError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={createMutation.isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Products
