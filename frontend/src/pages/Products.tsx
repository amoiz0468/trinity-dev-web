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
} from '@mui/material'
import { QrCode2 as BarcodeIcon, Edit as EditIcon, ExpandMore as ExpandMoreIcon, Clear as ClearIcon, TuneOutlined as TuneIcon } from '@mui/icons-material'
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
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your product inventory
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={5}>
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
          <Grid item xs={12} sm={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Add Product
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Advanced Filters */}
      <Accordion
        expanded={expandedFilters}
        onChange={() => setExpandedFilters(!expandedFilters)}
        sx={{ mb: 3, bgcolor: '#f5f5f5' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <TuneIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Advanced Filters
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: '100%' }}>
            <Grid container spacing={3}>
              {/* Stock Filter */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
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

              {/* Price Range Filter */}
              <Grid item xs={12} sm={6}>
                <Typography gutterBottom variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue as [number, number])}
                  valueLabelDisplay="auto"
                  min={Math.floor(minPrice)}
                  max={Math.ceil(maxPrice) || 1000}
                  step={1}
                  marks={[
                    { value: Math.floor(minPrice), label: `$${Math.floor(minPrice)}` },
                    { value: Math.ceil(maxPrice) || 1000, label: `$${Math.ceil(maxPrice) || 1000}` },
                  ]}
                />
              </Grid>

              {/* Results Summary */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {products.length} of {allProducts.length} products
                  </Typography>
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
                    Clear Filters
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>

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
                <TableCell>Image</TableCell>
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
                  <TableCell>
                    <Box
                      component="img"
                      src={product.picture_url || ''}
                      alt={product.name}
                      sx={{
                        width: 48,
                        height: 48,
                        objectFit: 'cover',
                        borderRadius: 1,
                        bgcolor: '#f5f5f5',
                        border: '1px solid #eee',
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.visibility = 'hidden'
                      }}
                    />
                  </TableCell>
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
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 1, mb: 1 }}
          >
            {form.picture ? `Selected: ${form.picture.name}` : 'Upload Image'}
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
