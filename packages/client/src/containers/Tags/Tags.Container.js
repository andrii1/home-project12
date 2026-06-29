import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Tags.Style.css';
import { apiURL } from '../../apiURL';
import { CardCategories } from '../../components/CardCategories/CardCategories.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../components/Button/Button.component';
import { capitalize } from '../../utils/capitalize';

export const Tags = () => {
  const [searchTerms, setSearchTerms] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    async function fetchTags() {
      const response = await fetch(`${apiURL()}/tags/`);
      const data = await response.json();
      setTags(data);
    }
    fetchTags();
  }, []);

  const groupedTags = Object.entries(
    tags
      .filter((tag) =>
        tag.title.toLowerCase().includes(searchTerms.toLowerCase()),
      )
      .sort((a, b) => a.title.localeCompare(b.title))
      .reduce((acc, tag) => {
        const letter = tag.title[0].toUpperCase();
        (acc[letter] ||= []).push({
          id: tag.id,
          title: tag.title,
          slug: tag.slug,
        });
        return acc;
      }, {}),
  ).map(([letter, tagTitles]) => ({ letter, tagTitles }));

  const handleSearch = (event) => {
    setSearchTerms(event.target.value);
  };

  const cardItems = groupedTags.map((item) => {
    return (
      <div className="card-category-new">
        <h2>{item.letter}</h2>
        <div className="topics-div">
          {item.tagTitles.map((tag) => (
            <Link to={`/products/tags/${tag.slug}`}>
              <Button secondary label={capitalize(tag.title)} />
            </Link>
          ))}
        </div>
      </div>
    );
  });

  return (
    <main>
      <Helmet>
        <title>Tags</title>
        <meta name="description" content="Find best products by tags" />
      </Helmet>
      {/* <div className="hero"></div> */}
      <div className="hero">
        <h1 className="hero-header">Tags</h1>

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
              placeholder="Search tags"
            />
          </label>
        </form>
      </div>
      <section className="container-cards-tags">
        {' '}
        {groupedTags.length > 0 ? cardItems : 'No tags found'}
      </section>
    </main>
  );
};
