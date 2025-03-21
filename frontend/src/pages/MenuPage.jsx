import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { getMenu, addMenuItem } from '../services/api';

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newItem, setNewItem] = useState({ item: '', price: '' });

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

  const handleAddItem = async () => {
    try {
      await addMenuItem(newItem.item, parseFloat(newItem.price));
      setOpenDialog(false);
      setNewItem({ item: '', price: '' });
      loadMenu();
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un article:', error);
    }
  };

  return (
    <Container className="container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Menu du Restaurant</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          Ajouter un article
        </Button>
      </Box>

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{item.item}</Typography>
                <Typography color="textSecondary">
                  {item.price.toFixed(2)} €
                </Typography>
                {item.customizations && item.customizations.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2">Suppléments disponibles:</Typography>
                    {item.customizations.map((custom, index) => (
                      <Typography key={index} variant="body2">
                        • {custom.name} (+{custom.price.toFixed(2)} €)
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Ajouter un article au menu</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de l'article"
            fullWidth
            value={newItem.item}
            onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Prix"
            type="number"
            fullWidth
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleAddItem} color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MenuPage; 