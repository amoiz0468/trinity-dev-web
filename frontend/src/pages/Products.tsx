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
} from '@mui/material'
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
  })
  const [formError, setFormError] = useState('')

  const { data, isLoading, error } = useQuery('products', productService.getAll, {
    retry: 1,
  })

  // Handle paginated responses or direct array
  const products = Array.isArray(data) ? data : (data?.results || [])

  const createMutation = useMutation(productService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('products')
      setOpen(false)
      setForm({ name: '', brand: '', price: '', quantity_in_stock: '' })
      setFormError('')
    },
    onError: () => {
      setFormError('Failed to create product. Please try again.')
    },
  })

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

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Add Product
      </Button>

      {!products || products.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="text.secondary">
            No products found. Use "Add Product" to create one.
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
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <TextField
            label="Brand"
            fullWidth
            margin="dense"
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
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
