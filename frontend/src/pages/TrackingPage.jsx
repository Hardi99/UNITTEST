import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { getOrderStatus } from '../services/api';

const steps = ['Préparation', 'Prête', 'Livrée'];

function TrackingPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [error, setError] = useState('');

  const handleTrackOrder = async () => {
    try {
      setError('');
      const response = await getOrderStatus(orderNumber);
      if (response.data.success) {
        setTrackingInfo(response.data.tracking);
      } else {
        setError('Commande non trouvée');
        setTrackingInfo(null);
      }
    } catch (error) {
      setError('Erreur lors de la recherche de la commande');
      setTrackingInfo(null);
    }
  };

  const getActiveStep = () => {
    switch (trackingInfo?.status) {
      case 'préparation':
        return 0;
      case 'prêt':
        return 1;
      case 'livré':
        return 2;
      default:
        return -1;
    }
  };

  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'card':
        return 'Carte bancaire';
      case 'cash':
        return 'Espèces';
      default:
        return 'Non spécifié';
    }
  };

  return (
    <Container className="container">
      <Typography variant="h4" gutterBottom>
        Suivi de Commande
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Numéro de commande"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleTrackOrder}
              disabled={!orderNumber}
            >
              Suivre
            </Button>
          </Box>
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>

      {trackingInfo && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statut de la commande #{orderNumber}
                </Typography>
                <Stepper activeStep={getActiveStep()} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Détails de la commande :
                  </Typography>
                  <List>
                    {trackingInfo.items.map((item, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={item.item}
                            secondary={`${item.quantity}x - ${item.price.toFixed(2)} €`}
                          />
                        </ListItem>
                        {index < trackingInfo.items.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Total: {trackingInfo.total.toFixed(2)} €
                    </Typography>
                    <Chip
                      label={`Paiement: ${formatPaymentMethod(trackingInfo.paymentMethod)}`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    Temps estimé: {trackingInfo.estimatedTime} minutes
                  </Typography>
                  {trackingInfo.notes && trackingInfo.notes.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Notes :
                      </Typography>
                      <List>
                        {trackingInfo.notes.map((note, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={note} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default TrackingPage; 