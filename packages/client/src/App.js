import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Categories } from './containers/Categories/Categories.Container';
import { Products } from './containers/Products/Products.Container';
import { LandingPage } from './containers/LandingPage/LandingPage.Container';
import TestPage from './containers/TestPage/TestPage.Container';
import { Prompts } from './containers/Prompts/Prompts.Container';
import { ProductView } from './containers/ProductView/ProductView.container';
import { Signup } from './containers/Signup/Signup.Container';
import Login from './containers/Login/Login.Container';
import Reset from './containers/Reset/Reset.Container';
import { Dashboard } from './containers/Dashboard/Dashboard.Container';
import { Bookmarks } from './containers/Bookmarks/Bookmarks.Container';
import { Faq } from './containers/Faq/Faq.Container';
import { Submit } from './containers/Submit/Submit.Container';
import { StripeSuccess } from './containers/StripeSuccess/StripeSuccess.Container';
import { StripeCancel } from './containers/StripeCancel/StripeCancel.Container';
import { PageNotFound } from './containers/PageNotFound/PageNotFound.Container';
import { Navigation } from './components/Navigation/Navigation.component';
import { Footer } from './components/Footer/Footer.component';
import { UserProvider } from './userContext';
import { Tags } from './containers/Tags/Tags.Container';

function App() {
  return (
    <div className="app">
      <Router>
        <UserProvider>
          <Navigation />
          <Routes>
            <Route path="/" element={<Products />} />
            {/* <Route path="/products" element={<Products />} /> */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/test" element={<Prompts />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/tags" element={<Tags />} />
            <Route exact path="/products/:slug" element={<ProductView />} />
            <Route path="/products/*" element={<Products />} />
            <Route
              exact
              path="/products/category/:categoryIdParam"
              element={<Products />}
            />
            <Route
              exact
              path="/products/search/:searchParam"
              element={<Products />}
            />
            <Route
              exact
              path="/products/tag/:tagSlugParam"
              element={<Products />}
            />
            <Route exact path="/faq" element={<Faq />} />
            <Route exact path="/products/new" element={<Submit />} />
            <Route exact path="/success" element={<StripeSuccess />} />
            <Route exact path="/cancel" element={<StripeCancel />} />
            <Route exact path="/bookmarks" element={<Bookmarks />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route exact path="/reset" element={<Reset />} />
            <Route exact path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Footer />
        </UserProvider>
      </Router>
    </div>
  );
}

export default App;
