import React from 'react'
import classes from './Home.module.css'
import { Container, Box, Typography, Grid, Card, CardContent } from '@mui/material'
import { Security, Support, SwapHoriz, TrendingUp, AccountBalance, Shield } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import Button from '../generic/Button'

function Home() {
  const navigate = useNavigate();

  return (
    <div className={classes.pageContainer}>
    <Container maxWidth="lg" className={classes.content}>
      {/* Hero Section */}
      <Box className={classes.welcSection}>
        <Typography variant="h3" gutterBottom>
          Welcome to BAMBanking
        </Typography>
        <Typography variant="h6" gutterBottom>
          Your trusted partner for secure and reliable banking services.
        </Typography>
        <Button 
          text1="Open an Account"
          onClickHandler={() => window.location.href = '/newAccount'}
        />
      </Box>

      {/* Features Section */}
      <Box className={classes.featuresSection}>
        <Typography variant="h4" align="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card className={classes.featureCard}>
              <CardContent className={classes.cardContent}>
                <Security className={classes.cardIcon} />
                <Typography variant="h6" className={classes.cardTitle}>Secure Banking</Typography>
                <Typography className={classes.cardDescription}>
                  Advanced encryption to keep your transactions safe.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className={classes.featureCard}>
              <CardContent className={classes.cardContent}>
                <Support className={classes.cardIcon} />
                <Typography variant="h6" className={classes.cardTitle}>24/7 Customer Support</Typography>
                <Typography className={classes.cardDescription}>
                  We are here to assist you anytime, anywhere.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className={classes.featureCard}>
              <CardContent className={classes.cardContent}>
                <SwapHoriz className={classes.cardIcon} />
                <Typography variant="h6" className={classes.cardTitle}>Easy Transfers</Typography>
                <Typography className={classes.cardDescription}>
                  Instant fund transfers with a single click.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Statistics Section */}
      <Box className={classes.statsSection}>
        <Typography variant="h4" align="center" gutterBottom>
          Trusted by Thousands
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box className={classes.statItem}>
              <TrendingUp className={classes.statIcon} />
              <Typography variant="h3" className={classes.statNumber}>50K+</Typography>
              <Typography variant="body1">Active Customers</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className={classes.statItem}>
              <AccountBalance className={classes.statIcon} />
              <Typography variant="h3" className={classes.statNumber}>$2B+</Typography>
              <Typography variant="body1">Assets Under Management</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className={classes.statItem}>
              <Shield className={classes.statIcon} />
              <Typography variant="h3" className={classes.statNumber}>99.9%</Typography>
              <Typography variant="body1">Security Uptime</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Links */}
      <Box className={classes.quickLinksSection}>
        <Typography variant="h4" gutterBottom>
          Get Started Today
        </Typography>
        <Typography variant="body1" className={classes.quickLinksSubtext}>
          Join thousands of satisfied customers who trust BAM Banking
        </Typography>
        <Grid container justifyContent="center" spacing={3} className={classes.quickLinksGrid}>
          <Grid item>
            <Button text1="Login to Account" onClickHandler={() => navigate('/login')} />
          </Grid>
          <Grid item>
            <Button text1="Open New Account" onClickHandler={() => navigate('/newAccount')} />
          </Grid>
        </Grid>
      </Box>

    </Container>
    {/* Footer */}
    <Box className={classes.footer}>
      <Typography variant="body2">© 2024 TrustBank. All rights reserved.</Typography>
    </Box>
    </div>
  );
}

export default Home;


