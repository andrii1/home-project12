import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Categories.Style.css';
import { apiURL } from '../../apiURL';
import { CardCategories } from '../../components/CardCategories/CardCategories.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../components/Button/Button.component';
import { capitalize } from '../../utils/capitalize';

export const Categories = () => {
  const [searchTerms, setSearchTerms] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetch(`${apiURL()}/categories/`);
      const categoriesResponse = await response.json();
      setCategories(categoriesResponse);
    }

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.title.toLowerCase().includes(searchTerms.toLowerCase()),
  );

  const handleSearch = (event) => {
    setSearchTerms(event.target.value);
  };

  const cardItems = filteredCategories.map((category) => {
    return (
      <div className="card-category-new">
        <Link to={`/products/categories/${category.slug}`}>
          <Button secondary label={capitalize(category.title)} />
        </Link>
      </div>
    );
  });

  return (
    <main>
      <Helmet>
        <title>Categories</title>
        <meta name="description" content="Find best Amazon products" />
      </Helmet>
      {/* <div className="hero"></div> */}
      <div className="hero">
        <h1 className="hero-header">Categories</h1>

        <form>
          <label>
            <FontAwesomeIcon
              className="search-icon-categories"
              icon={faSearch}
            />
            <input
              type="text"
              className="input-search-home"
              onChange={handleSearch}
              /* onFocus={handleClick} */
              placeholder="Search categories"
            />
          </label>
        </form>
      </div>
      <section className="container-cards-tags">
        {filteredCategories.length > 0 ? cardItems : 'No categories found'}
      </section>
    </main>
  );
};
