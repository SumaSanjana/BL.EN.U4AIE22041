import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Stock Analytics
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Stock Page
        </Button>
        <Button color="inherit" component={Link} to="/correlation">
          Correlation Heatmap
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;