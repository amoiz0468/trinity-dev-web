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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Stack,
  Card,
  CardContent,
  Alert,
  InputBase,
} from '@mui/material'
import { QrCode2 as BarcodeIcon, Edit as EditIcon, ExpandMore as ExpandMoreIcon, Clear as ClearIcon, TuneOutlined as TuneIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material'
import { productService } from '../services'
import { useState, useMemo } from 'react'

const Products = () => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    brand: '',
    price: '',
    quantity_in_stock: '',
    barcode: '',
    picture: null as File | null,
    picture_url: '',
  })
  const [formError, setFormError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStock, setFilterStock] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all')
  const [useBarcode, setUseBarcode] = useState(false)
  const [syncing, setSyncing] = useState(false)
  
  // Advanced filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'newest'>('newest')
  const [expandedFilters, setExpandedFilters] = useState(true)

  const { data, isLoading, error } = useQuery('products', productService.getAll, {
    retry: 1,
  })

  // Handle paginated responses or direct array
  const allProducts = Array.isArray(data) ? data : (data?.results || [])

  // Get price range from products
  const minPrice = useMemo(() => {
    return allProducts.length > 0 ? Math.min(...allProducts.map((p: any) => parseFloat(p.price) || 0)) : 0
  }, [allProducts])

  const maxPrice = useMemo(() => {
    return allProducts.length > 0 ? Math.max(...allProducts.map((p: any) => parseFloat(p.price) || 0)) : 1000
  }, [allProducts])

  // Apply client-side filtering and sorting
  const products = useMemo(() => {
    let filtered = allProducts.filter((product: any) => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStock = filterStock === 'all' ||
        (filterStock === 'in-stock' && product.stock_status === 'In Stock') ||
        (filterStock === 'low-stock' && product.stock_status === 'Low Stock') ||
        (filterStock === 'out-of-stock' && product.stock_status === 'Out of Stock')

      const price = parseFloat(product.price) || 0
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1]
      
      return matchesSearch && matchesStock && matchesPrice
    })

    // Apply sorting
    const sorted = [...filtered].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price)
        case 'stock':
          return b.quantity_in_stock - a.quantity_in_stock
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    return sorted
  }, [allProducts, searchTerm, filterStock, priceRange, sortBy])

  const createMutation = useMutation(productService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('products')
      setOpen(false)
      setForm({ name: '', brand: '', price: '', quantity_in_stock: '', barcode: '', picture: null, picture_url: '' })
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
        picture_url: result.product.picture_url || form.picture_url,
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

    const payload = new FormData()
    payload.append('name', form.name)
    if (form.brand) payload.append('brand', form.brand)
    payload.append('price', form.price)
    payload.append('quantity_in_stock', form.quantity_in_stock)
    if (form.barcode) payload.append('barcode', form.barcode)
    if (form.picture) {
      payload.append('picture', form.picture)
    } else if (form.picture_url) {
      payload.append('picture_url', form.picture_url)
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
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
          Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your product inventory and catalog
        </Typography>
      </Box>

      {/* Top Actions & Search Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
        <Box
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 auto' },
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#f5f5f5',
            borderRadius: '24px',
            px: 2,
            py: 1,
            gap: 1,
            maxWidth: { xs: '100%', sm: 400 },
          }}
        >
          <SearchIcon sx={{ color: '#999', fontSize: 20 }} />
          <InputBase
            placeholder="Search products..."
            sx={{
              color: '#1a1a1a',
              '& input': {
                padding: '8px 0',
                fontSize: '0.9rem',
              },
              '& input::placeholder': {
                color: '#999',
                opacity: 1,
              },
              flex: 1,
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 600,
            px: 3,
            py: 1.2,
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Filters Section */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="price">Price (Low to High)</MenuItem>
                <MenuItem value="stock">Stock (High to Low)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={filterStock}
                label="Stock Status"
                onChange={(e) => setFilterStock(e.target.value as any)}
              >
                <MenuItem value="all">All Products</MenuItem>
                <MenuItem value="in-stock">In Stock</MenuItem>
                <MenuItem value="low-stock">Low Stock</MenuItem>
                <MenuItem value="out-of-stock">Out of Stock</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
              Price: ${priceRange[0]} - ${priceRange[1]}
            </Typography>
            <Slider
              value={priceRange}
              onChange={(e, newValue) => setPriceRange(newValue as [number, number])}
              valueLabelDisplay="auto"
              min={Math.floor(minPrice)}
              max={Math.ceil(maxPrice) || 1000}
              step={1}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2} sx={{ textAlign: 'right' }}>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={() => {
                setSearchTerm('')
                setFilterStock('all')
                setPriceRange([Math.floor(minPrice), Math.ceil(maxPrice) || 1000])
                setSortBy('newest')
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Showing {products.length} of {allProducts.length} products
        </Typography>
      </Box>

      {!products || products.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {searchTerm || filterStock !== 'all' 
              ? '🔍 No products match your filters'
              : '📦 No products yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || filterStock !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Click "Add Product" to get started'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Brand</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1a1a' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, index) => (
                <TableRow 
                  key={product.id}
                  sx={{
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                    },
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <TableCell>
                    <Box
                      component="img"
                      src={product.picture_url || ''}
                      alt={product.name}
                      sx={{
                        width: 50,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: '8px',
                        bgcolor: '#f5f5f5',
                        border: '1px solid #eee',
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.visibility = 'hidden'
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                  <TableCell>{product.brand || '-'}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#667eea' }}>${product.price}</TableCell>
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
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', pb: 1 }}>
          Add New Product
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
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

          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

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
                size="small"
              />
              <Button
                variant="outlined"
                fullWidth
                onClick={handleSyncBarcode}
                disabled={syncing || !form.barcode}
                sx={{ mt: 2, mb: 2 }}
              >
                {syncing ? 'Fetching...' : 'Fetch Data from Open Food Facts'}
              </Button>
              
              {(form.name || form.brand) && (
                <>
                  <Divider sx={{ my: 2 }}>Auto-filled Information</Divider>
                  <Typography variant="body2" color="success.main" sx={{ mb: 1, fontWeight: 600 }}>
                    ✓ Product data fetched successfully!
                  </Typography>
                </>
              )}
            </>
          ) : null}

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Basic Information</Typography>
          <TextField
            label="Product Name"
            fullWidth
            margin="dense"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            disabled={useBarcode && syncing}
            size="small"
          />
          <TextField
            label="Brand"
            fullWidth
            margin="dense"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            disabled={useBarcode && syncing}
            size="small"
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Pricing & Stock</Typography>
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="dense"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            size="small"
            inputProps={{ step: "0.01", min: "0" }}
          />
          <TextField
            label="Quantity in Stock"
            type="number"
            fullWidth
            margin="dense"
            value={form.quantity_in_stock}
            onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
            required
            size="small"
            inputProps={{ min: "0" }}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Media</Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 0.5, mb: 1 }}
          >
            {form.picture ? `✓ ${form.picture.name}` : '📷 Upload Image'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                setForm({ ...form, picture: file || null })
              }}
            />
          </Button>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={createMutation.isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isLoading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {createMutation.isLoading ? 'Saving...' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Products
