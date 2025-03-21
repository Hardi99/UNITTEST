import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { getMenu, addToCart, placeOrder, processPayment } from '../services/api';

function OrderPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderNumber, setOrderNumber] = useState(null);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await getMenu();
      setMenuItems(response.data.menu);
    } catch (error) {
      console.error('Erreur lors du chargement du menu:', error);
    }
  };

  const handleAddToCart = async (item, price) => {
    try {
      await addToCart(item, price);
      setCart([...cart, { item, price }]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await placeOrder();
      setOrderNumber(response.data.order.orderNumber);
      setOpenPaymentDialog(true);
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
    }
  };

  const handlePayment = async () => {
    try {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      await processPayment(orderNumber, total, paymentMethod);
      setOpenPaymentDialog(false);
      setCart([]);
      setOrderNumber(null);
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <Container className="container">
      <Typography variant="h4" gutterBottom>
        Commander
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Menu
          </Typography>
          <Grid container spacing={2}>
            {menuItems.map((item) => (
              <Grid item xs={12} sm={6} key={item._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{item.item}</Typography>
                    <Typography color="textSecondary">
                      {item.price.toFixed(2)} €
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleAddToCart(item.item, item.price)}
                      sx={{ mt: 1 }}
                    >
                      Ajouter au panier
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Panier
              </Typography>
              <List>
                {cart.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={item.item}
                        secondary={`${item.price.toFixed(2)} €`}
                      />
                    </ListItem>
                    {index < cart.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">
                  Total: {total.toFixed(2)} €
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0}
                  sx={{ mt: 2 }}
                >
                  Commander
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
        <DialogTitle>Paiement de la commande #{orderNumber}</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Total à payer: {total.toFixed(2)} €
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Méthode de paiement</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              label="Méthode de paiement"
            >
              <MenuItem value="card">Carte bancaire</MenuItem>
              <MenuItem value="cash">Espèces</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Annuler</Button>
          <Button
            onClick={handlePayment}
            color="primary"
            disabled={!paymentMethod}
          >
            Payer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default OrderPage; 