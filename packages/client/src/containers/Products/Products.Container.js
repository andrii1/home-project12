import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Link,
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Products.Style.css';
import { apiURL } from '../../apiURL';
import { Card } from '../../components/Card/Card.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../../components/Button/Button.component';
import { Loading } from '../../components/Loading/Loading.Component';
import DropDownView from '../../components/CategoriesListDropDown/CategoriesListDropDown.component';
// eslint-disable-next-line import/no-extraneous-dependencies
import InfiniteScroll from 'react-infinite-scroll-component';
import Modal from '../../components/Modal/Modal.Component';
import { useUserContext } from '../../userContext';
import { capitalize } from '../../utils/capitalize';
import { getPageMeta } from '../../utils/getPageMeta';
import {
  PRICING_OPTIONS,
  PLATFORMS_OPTIONS,
  SOCIALS_OPTIONS,
  OTHER_OPTIONS,
} from '../../lib/constants/filters';

import {
  faSearch,
  faFilter,
  faList,
  faGrip,
  faBookmark as faBookmarkSolid,
  faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import { ListFilter, X } from 'lucide-react';

import globe from '../../assets/images/globe.svg';
import { logInWithEmailAndPassword } from '../../firebase';
import MultiSelectDropdown from '../../components/MultiSelectDropdown/MultiSelectDropdown.component';

const tabs = ['Categories', 'Tags'];

export const Products = () => {
  const { user } = useUserContext();
  const location = useLocation();
  // const { searchParam } = useParams();
  const [searchTerms, setSearchTerms] = useState();
  const [sortOrder, setSortOrder] = useState('Recent');

  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [countries, setCountries] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cities, setCities] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [filteredHighlights, setFilteredHighlights] = useState([]);
  const [filteredUserTypes, setFilteredUserTypes] = useState([]);
  const [filteredOccasions, setFilteredOccasions] = useState([]);
  const [filteredUseCases, setFilteredUseCases] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredPricing, setFilteredPricing] = useState([]);
  const [filteredPlatforms, setFilteredPlatforms] = useState([]);
  const [filteredSocials, setFilteredSocials] = useState([]);
  const [filteredOther, setFilteredOther] = useState([]);
  const [filteredSearch, setFilteredSearch] = useState([]);
  const [showFiltersContainer, setShowFiltersContainer] = useState(false);
  const [showCategoriesContainer, setShowCategoriesContainer] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [page, setPage] = useState(0);
  const [counter, setCounter] = useState(0);
  const [products, setApps] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [orderBy, setOrderBy] = useState({
    column: 'id',
    direction: 'desc',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('Categories');
  const [showTagsContainer, setShowTagsContainer] = useState(false);
  const [showSearchContainer, setShowSearchContainer] = useState(false);
  const [searchTrending, setSearchTrending] = useState([]);
  const navigate = useNavigate();
  const [filtersReady, setFiltersReady] = useState(false);

  const toggleModal = () => {
    setOpenModal(false);
    document.body.style.overflow = 'visible';
  };

  const parseFiltersFromPath = useCallback(() => {
    // Remove "/products/" from the start
    const path = location.pathname.replace(/^\/products\/?/, '');
    const parts = path.split('/');

    const filters = {};
    for (let i = 0; i < parts.length; i += 2) {
      const key = parts[i];
      const value = parts[i + 1];
      if (key && value) {
        filters[key] = value.split(',');
      }
    }
    return filters;
  }, [location.pathname]);

  // set filters from url
  useEffect(() => {
    const filters = parseFiltersFromPath();

    setFilteredCategories(filters.categories || []);
    setFilteredTags(filters.tags || []);
    setFilteredHighlights(filters.highlights || []);
    setFilteredCountries(filters.countries || []);
    setFilteredAreas(filters.areas || []);
    setFilteredCities(filters.cities || []);
    setFilteredUserTypes(filters.userTypes || []);
    setFilteredOccasions(filters.occasions || []);
    setFilteredUseCases(filters.useCases || []);
    setFilteredPricing(filters.pricing || []);
    setFilteredPlatforms(filters.platforms || []);
    setFilteredSocials(filters.socials || []);
    setFilteredOther(filters.other || []);
    setFilteredSearch(filters.search || []);
    setFiltersReady(true); // <---- ADD THIS
  }, [location.pathname, parseFiltersFromPath]);

  // first fetch
  useEffect(() => {
    if (!filtersReady) return; // ⛔ Wait until filters loaded
    setPage(0);
    setIsLoading(true);
    const params = new URLSearchParams({
      page: 0,
      column: orderBy.column,
      direction: orderBy.direction,
    });

    // Categories
    if (filteredCategories.length > 0) {
      params.append('categories', filteredCategories.join(','));
    }

    // Countries
    if (filteredCountries.length > 0) {
      params.append('countries', filteredCountries.join(','));
    }

    // Areas
    if (filteredAreas.length > 0) {
      params.append('areas', filteredAreas.join(','));
    }

    // Cities
    if (filteredCities.length > 0) {
      params.append('cities', filteredCities.join(','));
    }

    // Tags
    if (filteredTags.length > 0) {
      params.append('tags', filteredTags.join(','));
    }

    // Highlights
    if (filteredHighlights.length > 0) {
      params.append('highlights', filteredHighlights.join(','));
    }

    // User types
    if (filteredUserTypes.length > 0) {
      params.append('userTypes', filteredUserTypes.join(','));
    }

    // Occasions
    if (filteredOccasions.length > 0) {
      params.append('occasions', filteredOccasions.join(','));
    }

    // useCases
    if (filteredUseCases.length > 0) {
      params.append('useCases', filteredUseCases.join(','));
    }

    // Pricing
    if (filteredPricing.length > 0) {
      params.append('pricing', filteredPricing.join(','));
    }

    // Platforms
    if (filteredPlatforms.length > 0) {
      params.append('platforms', filteredPlatforms.join(','));
    }

    // Socials
    if (filteredSocials.length > 0) {
      params.append('socials', filteredSocials.join(','));
    }

    // Other
    if (filteredOther.length > 0) {
      params.append('other', filteredOther.join(','));
    }

    // Search
    if (filteredSearch.length > 0) {
      params.append('search', filteredSearch.join(','));
    }

    const url = `${apiURL()}/products?${params.toString()}`;

    async function fetchData() {
      const response = await fetch(url);
      const json = await response.json();

      let hasMore = true;
      if (json.data?.some((item) => item.id === json.lastItem.id)) {
        hasMore = false;
      }

      setApps({
        data: json.data,
        lastItem: json.lastItem,
        hasMore,
      });
      // setPage((prevPage) => prevPage + 1);
      setPage(1);
      setIsLoading(false);
    }

    fetchData();
  }, [
    filteredCategories,
    orderBy.column,
    orderBy.direction,
    filteredPricing,
    filteredTags,
    filteredPlatforms,
    filteredSocials,
    filteredOther,
    filteredHighlights,
    filteredUserTypes,
    filteredOccasions,
    filteredUseCases,
    searchParams,
    filteredSearch,
    filtersReady,
    filteredCountries,
    filteredAreas,
    filteredCities,
  ]);

  const fetchApps = async () => {
    if (!filtersReady) return; // ⛔ Wait until filters loaded
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page,
      column: orderBy.column,
      direction: orderBy.direction,
    });

    // Categories
    if (filteredCategories.length > 0) {
      params.append('categories', filteredCategories.join(','));
    }

    // Countries
    if (filteredCountries.length > 0) {
      params.append('countries', filteredCountries.join(','));
    }

    // Areas
    if (filteredAreas.length > 0) {
      params.append('areas', filteredAreas.join(','));
    }

    // Cities
    if (filteredCities.length > 0) {
      params.append('cities', filteredCities.join(','));
    }

    // Tags
    if (filteredTags.length > 0) {
      params.append('tags', filteredTags.join(','));
    }

    // Highlights
    if (filteredHighlights.length > 0) {
      params.append('highlights', filteredHighlights.join(','));
    }

    // User types
    if (filteredUserTypes.length > 0) {
      params.append('userTypes', filteredUserTypes.join(','));
    }

    // Business models
    if (filteredOccasions.length > 0) {
      params.append('occasions', filteredOccasions.join(','));
    }

    // useCases
    if (filteredUseCases.length > 0) {
      params.append('useCases', filteredUseCases.join(','));
    }

    // Pricing
    if (filteredPricing.length > 0) {
      params.append('pricing', filteredPricing.join(','));
    }

    // Platforms
    if (filteredPlatforms.length > 0) {
      params.append('platforms', filteredPlatforms.join(','));
    }

    // Socials
    if (filteredSocials.length > 0) {
      params.append('socials', filteredSocials.join(','));
    }

    // Other
    if (filteredOther.length > 0) {
      params.append('other', filteredOther.join(','));
    }

    // Search
    // if (search && search.trim() !== '') {
    //   params.append('search', search.trim());
    // }

    // Search
    if (filteredSearch.length > 0) {
      params.append('search', filteredSearch.join(','));
    }

    const url = `${apiURL()}/products?${params.toString()}`;

    const response = await fetch(url);
    const json = await response.json();

    // setApps({ data: json.data, totalCount: json.totalCount, hasMore });

    let hasMore = true;

    if (json.data?.some((item) => item.id === json.lastItem.id)) {
      hasMore = false;
    }

    setApps((prevItems) => {
      return {
        data: [...prevItems.data, ...json.data],
        lastItem: json.lastItem,
        hasMore,
      };
    });

    setPage((prev) => prev + 1);
  };

  // useEffect(() => {
  //   async function fetchAppsSearch() {
  //     const responseApps = await fetch(`${apiURL()}/products/`);

  //     const responseAppsJson = await responseApps.json();

  //     if (searchTerms) {
  //       const filteredSearch = responseAppsJson.filter(
  //         (item) =>
  //           item.title.toLowerCase().includes(searchTerms.toLowerCase()) ||
  //           item.description
  //             .toLowerCase()
  //             .includes(searchTerms.toLowerCase()) ||
  //           item.categoryTitle
  //             .toLowerCase()
  //             .includes(searchTerms.toLowerCase()),
  //       );
  //       setResultsHome(filteredSearch);
  //     }
  //   }
  //   fetchAppsSearch();
  // }, [searchTerms]);

  // useEffect(() => {
  //   if (!filtersReady) return;

  //   setPage(0);
  // }, [
  //   // ALL filters that should trigger a reset
  //   filteredCategories,
  //   filteredTags,
  //   filteredHighlights,
  //   filteredUserTypes,
  //   filteredOccasions,
  //   filteredUseCases,
  //   filteredIndustries,
  //   filteredPlatforms,
  //   filteredSocials,
  //   filteredOther,
  //   filteredPricing,
  //   filteredSearch,
  //   filtersReady,

  //   // sorting
  //   sortOrder,

  //   // URL (only if you want URL → filters sync)
  //   location.pathname,
  // ]);

  // useEffect(() => {
  //   setPage(0);
  // }, [filteredDetails]);

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetch(`${apiURL()}/categories/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setCategories(sorted);
    }

    async function fetchCountries() {
      const response = await fetch(`${apiURL()}/countries/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setCountries(sorted);
    }

    async function fetchAreas() {
      const response = await fetch(`${apiURL()}/areas/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setAreas(sorted);
    }

    async function fetchCities() {
      const response = await fetch(`${apiURL()}/cities/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setCities(sorted);
    }

    async function fetchTags() {
      const response = await fetch(`${apiURL()}/tags/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setTags(sorted);
    }

    async function fetchHighlights() {
      const response = await fetch(`${apiURL()}/highlights/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setHighlights(sorted);
    }

    async function fetchUserTypes() {
      const response = await fetch(`${apiURL()}/userTypes/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setUserTypes(sorted);
    }

    async function fetchOccasions() {
      const response = await fetch(`${apiURL()}/occasions/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setOccasions(sorted);
    }

    async function fetchUseCases() {
      const response = await fetch(`${apiURL()}/useCases/`);
      const data = await response.json();
      const sorted = data.sort((a, b) => a.title.localeCompare(b.title));
      setUseCases(sorted);
    }

    fetchCategories();
    fetchCountries();
    fetchAreas();
    fetchCities();
    fetchTags();
    fetchHighlights();
    fetchUserTypes();
    fetchOccasions();
    fetchUseCases();
  }, []);

  const updateUrlFromFilters = (filters) => {
    const parts = [];
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        parts.push(`${key}/${values.join(',')}`);
      }
    });
    navigate(`/products/${parts.join('/')}`, { replace: true });
  };

  const filterHandler = (type, id) => {
    const filters = parseFiltersFromPath();
    const currentValues = filters[type] || [];

    const newValues = currentValues.includes(String(id))
      ? currentValues.filter((v) => v !== String(id))
      : [...currentValues, id];

    if (newValues.length > 0) {
      filters[type] = newValues;
    } else {
      delete filters[type];
    }

    updateUrlFromFilters(filters);
  };
  // const filterHandler = (type, id) => {
  //   const params = new URLSearchParams(location.search);
  //   const existing = params.get(type)?.split(',') || [];

  //   const newValues = existing.includes(String(id))
  //     ? existing.filter((v) => v !== String(id))
  //     : [...existing, id];

  //   if (newValues.length > 0) {
  //     params.set(type, newValues.join(','));
  //   } else {
  //     params.delete(type);
  //   }

  //   navigate(`/products?${params.toString()}`, { replace: true });
  // };

  // const filterHandler = (type, id) => {
  //   let currentValues;
  //   let setter;

  //   switch (type) {
  //     case 'categories':
  //       currentValues = filteredCategories;
  //       setter = setFilteredCategories;
  //       break;
  //     case 'tags':
  //       currentValues = filteredTags;
  //       setter = setFilteredTags;
  //       break;
  //     case 'highlights':
  //       currentValues = filteredHighlights;
  //       setter = setFilteredHighlights;
  //       break;
  //     case 'userTypes':
  //       currentValues = filteredUserTypes;
  //       setter = setFilteredUserTypes;
  //       break;
  //     case 'occasions':
  //       currentValues = filteredOccasions;
  //       setter = setFilteredOccasions;
  //       break;
  //     case 'useCases':
  //       currentValues = filteredUseCases;
  //       setter = setFilteredUseCases;
  //       break;
  //     case 'industries':
  //       currentValues = filteredIndustries;
  //       setter = setFilteredIndustries;
  //       break;
  //     case 'pricing':
  //       currentValues = filteredPricing;
  //       setter = setFilteredPricing;
  //       break;
  //     case 'platforms':
  //       currentValues = filteredPlatforms;
  //       setter = setFilteredPlatforms;
  //       break;
  //     case 'socials':
  //       currentValues = filteredSocials;
  //       setter = setFilteredSocials;
  //       break;
  //     case 'other':
  //       currentValues = filteredOther;
  //       setter = setFilteredOther;
  //       break;
  //     case 'search':
  //       currentValues = filteredSearch;
  //       setter = setFilteredSearch;
  //       break;
  //     default:
  //       return;
  //   }

  //   const newValues = currentValues.includes(id)
  //     ? currentValues.filter((v) => v !== id)
  //     : [...currentValues, id];

  //   setter(newValues);

  //   // Prepare all filters in an object
  //   const allFilters = {
  //     categories: type === 'categories' ? newValues : filteredCategories,
  //     tags: type === 'tags' ? newValues : filteredTags,
  //     highlights: type === 'highlights' ? newValues : filteredHighlights,
  //     userTypes: type === 'userTypes' ? newValues : filteredUserTypes,
  //     occasions:
  //       type === 'occasions' ? newValues : filteredOccasions,
  //     useCases: type === 'useCases' ? newValues : filteredUseCases,
  //     industries: type === 'industries' ? newValues : filteredIndustries,
  //     pricing: type === 'pricing' ? newValues : filteredPricing,
  //     platforms: type === 'platforms' ? newValues : filteredPlatforms,
  //     socials: type === 'socials' ? newValues : filteredSocials,
  //     other: type === 'other' ? newValues : filteredOther,
  //     search: type === 'search' ? newValues : filteredSearch,
  //   };

  //   const params = new URLSearchParams();

  //   // Only add non-empty arrays to the URL
  //   Object.entries(allFilters).forEach(([key, value]) => {
  //     if (value.length > 0) {
  //       params.set(key, value.join(','));
  //     }
  //   });

  //   navigate(`/products?${params.toString()}`, { replace: true });
  // };

  const clearFiltersHandler = () => {
    // Reset all filter states
    setFilteredCategories([]);
    setFilteredCountries([]);
    setFilteredAreas([]);
    setFilteredCities([]);
    setFilteredTags([]);
    setFilteredHighlights([]);
    setFilteredUserTypes([]);
    setFilteredOccasions([]);
    setFilteredUseCases([]);
    setFilteredPricing([]);
    setFilteredPlatforms([]);
    setFilteredSocials([]);
    setFilteredOther([]);
    setFilteredSearch([]);

    // Reset the URL (remove all query params)
    navigate('/', { replace: true });

    // ✅ Optional: also reset pagination/products if needed
    // setPage(0);
    // setApps({ data: [], lastItem: null, hasMore: true });
  };

  const filterHandlerAllCategories = () => {
    setFilteredCategories([]);

    // remove `/categories/...` from the pathname
    const newPath = location.pathname.replace(/\/categories\/[^/]+/, '');

    // keep query params if any
    const params = new URLSearchParams(location.search);
    const search = params.toString();

    navigate(search ? `${newPath}?${search}` : newPath, { replace: true });
  };

  const filterHandlerAllTags = () => {
    setFilteredTags([]);

    const newPath = location.pathname.replace(/\/tags\/[^/]+/, '');

    // keep query params if any
    const params = new URLSearchParams(location.search);
    const search = params.toString();

    navigate(search ? `${newPath}?${search}` : newPath, { replace: true });
  };

  const filterHandlerAllSearches = () => {
    setFilteredSearch([]);

    const newPath = location.pathname.replace(/\/search\/[^/]+/, '');

    // keep query params if any
    const params = new URLSearchParams(location.search);
    const search = params.toString();

    navigate(search ? `${newPath}?${search}` : newPath, { replace: true });
  };

  const categoriesList = categories.map((category) => {
    return (
      <Button
        onClick={() => filterHandler('categories', category.slug)}
        primary={filteredCategories.includes(String(category.slug))}
        secondary={!filteredCategories.includes(String(category.slug))}
        label={category.title}
      />
    );
  });

  const tagsList = tags.slice(0, 20).map((tag) => {
    return (
      <Button
        onClick={() => filterHandler('tags', tag.slug)}
        primary={filteredTags.includes(String(tag.slug))}
        secondary={!filteredTags.includes(String(tag.slug))}
        label={capitalize(tag.title)}
      />
    );
  });

  // useEffect(() => {
  //   async function fetchTrendingSearch() {
  //     const response = await fetch(`${apiURL()}/analytics?search=true`);
  //     const dataSearchAnalytics = await response.json();

  //     const result = dataSearchAnalytics
  //       .sort((a, b) => {
  //         return b.activeUsers - a.activeUsers;
  //       })
  //       .slice(0, 20);
  //     setSearchTrending(result);
  //   }

  //   fetchTrendingSearch();
  // }, []);

  // const searchList = searchTrending.map((searchItem) => {
  //   return (
  //     <Button
  //       onClick={() => filterHandler('search', searchItem.searchId)}
  //       primary={filteredTags.includes(String(searchItem.searchId))}
  //       secondary={!filteredTags.includes(String(searchItem.searchId))}
  //       label={capitalize(searchItem.searchId)}
  //     />
  //   );
  // });

  useEffect(() => {
    let column;
    let direction;
    if (sortOrder === 'A-Z') {
      column = 'title';
      direction = 'asc';
    } else if (sortOrder === 'Z-A') {
      column = 'title';
      direction = 'desc';
    } else if (sortOrder === 'Price (low to high)') {
      column = 'price';
      direction = 'asc';
    } else if (sortOrder === 'Price (high to low)') {
      column = 'price';
      direction = 'desc';
    } else if (sortOrder === 'Highest rated') {
      column = 'rating';
      direction = 'desc';
    } else if (sortOrder === 'Most reviews') {
      column = 'reviews';
      direction = 'desc';
    } else if (sortOrder === 'Highest discount') {
      column = 'discount_percentage';
      direction = 'desc';
    } else if (sortOrder === 'Most bookmarked') {
      column = 'mostBookmarked';
      direction = 'desc';
    } else {
      column = 'id';
      direction = 'desc';
    }

    setOrderBy({ column, direction });
  }, [sortOrder]);

  const sortOptions = [
    'Recent',
    'Highest rated',
    'Price (low to high)',
    'Price (high to low)',
    'Most reviews',
    'Highest discount',
    'Most bookmarked',
    'A-Z',
    'Z-A',
  ];

  const pricingList = PRICING_OPTIONS.map((item) => (
    <li key={item.key}>
      <input
        type="checkbox"
        value={item.key} // send key instead of label
        checked={filteredPricing.includes(item.key)} // ✅ bind state
        onChange={() => filterHandler('pricing', item.key)}
      />{' '}
      {item.label} {/* show human-friendly label */}
    </li>
  ));

  const platformsList = PLATFORMS_OPTIONS.map((item) => (
    <li key={item.key}>
      <input
        type="checkbox"
        value={item.key} // send key instead of label
        checked={filteredPlatforms.includes(item.key)} // ✅ bind state
        onChange={() => filterHandler('platforms', item.key)}
      />{' '}
      {item.label} {/* show human-friendly label */}
    </li>
  ));

  const socialsList = SOCIALS_OPTIONS.map((item) => (
    <li key={item.key}>
      <input
        type="checkbox"
        value={item.key} // send key instead of label
        checked={filteredSocials.includes(item.key)} // ✅ bind state
        onChange={() => filterHandler('socials', item.key)}
      />{' '}
      {item.label} {/* show human-friendly label */}
    </li>
  ));

  const otherList = OTHER_OPTIONS.map((item) => (
    <li key={item.key}>
      <input
        type="checkbox"
        value={item.key} // send key instead of label
        checked={filteredOther.includes(item.key)} // ✅ bind state
        onChange={() => filterHandler('other', item.key)}
      />{' '}
      {item.label} {/* show human-friendly label */}
    </li>
  ));

  const fetchFavorites = useCallback(async () => {
    const url = `${apiURL()}/favorites`;
    const response = await fetch(url, {
      headers: {
        token: `token ${user?.uid}`,
      },
    });
    const favoritesData = await response.json();

    if (Array.isArray(favoritesData)) {
      setFavorites(favoritesData);
    } else {
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (productId) => {
    const response = await fetch(`${apiURL()}/favorites`, {
      method: 'POST',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
      }),
    });
    if (response.ok) {
      fetchFavorites();
    }
  };

  const handleDeleteBookmarks = (favoritesId) => {
    const deleteFavorites = async () => {
      const response = await fetch(`${apiURL()}/favorites/${favoritesId} `, {
        method: 'DELETE',
        headers: {
          token: `token ${user?.uid}`,
        },
      });

      if (response.ok) {
        fetchFavorites();
      }
    };

    deleteFavorites();
  };

  const tabsGroup = tabs.map((tab) => {
    return (
      <Button
        tertiary={activeTab === tab}
        secondary={activeTab !== tab}
        label={tab}
        className="tab"
        onClick={() => {
          setActiveTab(tab);
        }}
      />
    );
  });

  const hasActiveFilters =
    filteredCategories.length > 0 ||
    filteredCountries.length > 0 ||
    filteredAreas.length > 0 ||
    filteredCities.length > 0 ||
    filteredTags.length > 0 ||
    filteredHighlights.length > 0 ||
    filteredUserTypes.length > 0 ||
    filteredOccasions.length > 0 ||
    filteredUseCases.length > 0 ||
    filteredPricing.length > 0 ||
    filteredPlatforms.length > 0 ||
    filteredSocials.length > 0 ||
    filteredOther.length > 0 ||
    filteredSearch.length > 0;

  const filterConfig = [
    {
      key: 'categories',
      label: 'Categories',
      values: filteredCategories,
      setter: setFilteredCategories,
      options: categories,
    },
    {
      key: 'countries',
      label: 'Countries',
      values: filteredCountries,
      setter: setFilteredCountries,
      options: countries,
    },
    {
      key: 'areas',
      label: 'Areas',
      values: filteredAreas,
      setter: setFilteredAreas,
      options: areas,
    },
    {
      key: 'cities',
      label: 'Cities',
      values: filteredCities,
      setter: setFilteredCities,
      options: cities,
    },
    {
      key: 'tags',
      label: 'Tags',
      values: filteredTags,
      setter: setFilteredTags,
      options: tags,
    },
    {
      key: 'highlights',
      label: 'Highlights',
      values: filteredHighlights,
      setter: setFilteredHighlights,
      options: highlights,
    },
    {
      key: 'userTypes',
      label: 'User Types',
      values: filteredUserTypes,
      setter: setFilteredUserTypes,
      options: userTypes,
    },
    {
      key: 'occasions',
      label: 'Business Models',
      values: filteredOccasions,
      setter: setFilteredOccasions,
      options: occasions,
    },
    {
      key: 'useCases',
      label: 'Use Cases',
      values: filteredUseCases,
      setter: setFilteredUseCases,
      options: useCases,
    },

    {
      key: 'pricing',
      label: 'Pricing',
      values: filteredPricing,
      setter: setFilteredPricing,
      options: PRICING_OPTIONS,
    },
    {
      key: 'platforms',
      label: 'Platforms',
      values: filteredPlatforms,
      setter: setFilteredPlatforms,
      options: PLATFORMS_OPTIONS,
    },
    {
      key: 'socials',
      label: 'Socials',
      values: filteredSocials,
      setter: setFilteredSocials,
      options: SOCIALS_OPTIONS,
    },
    {
      key: 'other',
      label: 'Other',
      values: filteredOther,
      setter: setFilteredOther,
      options: OTHER_OPTIONS,
    },
    {
      key: 'search',
      label: 'Search',
      values: filteredSearch,
      setter: setFilteredSearch,
      options: [],
    },
  ];

  const { pageMetaTitle, pageMetaDescription, pageHeaderTitle } = getPageMeta({
    filterConfig,
  });

  return (
    <main>
      <Helmet>
        <title>{pageMetaTitle}</title>
        <meta name="description" content={pageMetaDescription} />
      </Helmet>
      {/* <div className="hero"></div> */}
      <div className="hero products">
        <h1 className="hero-header">{pageHeaderTitle}</h1>
      </div>
      <div className="tabs-group">{tabsGroup}</div>
      {activeTab === 'Categories' && (
        <section className="container-topics-desktop">
          <Button
            primary={!filteredCategories.length > 0}
            secondary={filteredCategories.length > 0}
            label="All categories"
            onClick={filterHandlerAllCategories}
          />
          {categoriesList}
        </section>
      )}
      {activeTab === 'Tags' && (
        <section className="container-topics-desktop">
          <Button
            primary={!filteredTags.length > 0}
            secondary={filteredTags.length > 0}
            label="All tags"
            onClick={filterHandlerAllTags}
          />
          {tagsList}
          <Link to="/tags">
            <Button tertiary label="See all tags..." />
          </Link>
        </section>
      )}

      {/* {activeTab === 'Searches' && (
        <section className="container-topics-desktop">
          <Link to="/">
            <Button
              primary={!filteredSearch.length > 0}
              secondary={filteredSearch.length > 0}
              label="All searches"
              onClick={filterHandlerAllSearches}
            />
          </Link>

          {searchList}
        </section>
      )} */}
      {hasActiveFilters && (
        <section className="container-active-filters">
          {/* Active filter chips */}
          {filterConfig.map(
            (filter) =>
              filter.values.length > 0 && (
                <div key={filter.key} className="active-filter-item">
                  <span className="font-semibold">{filter.label}:</span>
                  {filter.values.map((item) => {
                    // find the matching option for display
                    const option = filter.options.find(
                      (opt) => String(opt.key ?? opt.slug) === String(item),
                    );
                    const displayLabel = option?.title || option?.label || item;

                    return (
                      <Button
                        key={item}
                        backgroundColor="#eee"
                        type="button"
                        onClick={() => filterHandler(filter.key, item)}
                        secondary
                        label={capitalize(displayLabel)}
                        icon={<X size={18} />}
                      />
                    );
                  })}
                </div>
              ),
          )}

          <Button
            backgroundColor="#FE3D32"
            type="button"
            onClick={clearFiltersHandler}
            primary
            label="Clear all filters"
          />
        </section>
      )}
      <section className="container-filters">
        {/* <Button
          secondary
          className="button-topics"
          onClick={(event) => {
            setShowSearchContainer(!showSearchContainer);
            setShowCategoriesContainer(false);
            setShowTagsContainer(false);
          }}
          backgroundColor="#ffe5d9"
          label="Searches"
        /> */}
        <DropDownView
          selectedOptionValue={sortOrder}
          className="no-line-height"
          options={sortOptions}
          onSelect={(option) => setSortOrder(option)}
          showFilterIcon={false}
        />

        <Button
          secondary
          onClick={(event) => setShowFiltersContainer(!showFiltersContainer)}
          backgroundColor="#ffe5d9"
          label="Filters"
          icon={<ListFilter size={18} />}
        />
        <Button
          secondary
          className="button-topics"
          onClick={(event) => {
            setShowCategoriesContainer(!showCategoriesContainer);
            setShowTagsContainer(false);
            setShowSearchContainer(false);
          }}
          backgroundColor="#ffe5d9"
          label="Categories"
        />
        <Button
          secondary
          className="button-topics"
          onClick={(event) => {
            setShowTagsContainer(!showTagsContainer);
            setShowCategoriesContainer(false);
            setShowSearchContainer(false);
          }}
          backgroundColor="#ffe5d9"
          label="Tags"
        />
        {/* <Button
          secondary
          onClick={() => setListView(!listView)}
          backgroundColor="#ffe5d9"
        >
          <div className="filter-grid">
            <FontAwesomeIcon size="lg" icon={faGrip} />
            <FontAwesomeIcon icon={faList} />
          </div>
        </Button> */}
      </section>
      <section
        className={`container-topics-mobile ${
          showCategoriesContainer && 'show'
        }`}
      >
        <Button
          primary={!filteredCategories.length > 0}
          secondary={filteredCategories.length > 0}
          label="All categories"
          onClick={filterHandlerAllCategories}
        />

        {categoriesList}
      </section>
      <section
        className={`container-topics-mobile ${showTagsContainer && 'show'}`}
      >
        <Button
          primary={!filteredTags.length > 0}
          secondary={filteredTags.length > 0}
          label="All tags"
          onClick={filterHandlerAllTags}
        />

        {tagsList}
      </section>
      <section
        className={`container-details-section ${
          showFiltersContainer && 'show'
        }`}
      >
        <div className="container-details filters">
          <div className="container-form">
            <div className="selector-group">
              <h3>Countries</h3>
              <MultiSelectDropdown
                options={countries}
                selected={filteredCountries}
                onChange={filterHandler}
                placeholder="Select countries"
                valueKey="slug"
                labelKey="title"
                title="countries"
              />
            </div>
            <div className="selector-group">
              <h3>Areas</h3>
              <MultiSelectDropdown
                options={areas}
                selected={filteredAreas}
                onChange={filterHandler}
                placeholder="Select areas"
                valueKey="slug"
                labelKey="title"
                title="areas"
              />
            </div>
            <div className="selector-group">
              <h3>Cities</h3>
              <MultiSelectDropdown
                options={cities}
                selected={filteredCities}
                onChange={filterHandler}
                placeholder="Select cities"
                valueKey="slug"
                labelKey="title"
                title="cities"
              />
            </div>
            <div className="selector-group">
              <h3>Highlights</h3>
              <MultiSelectDropdown
                options={highlights}
                selected={filteredHighlights}
                onChange={filterHandler}
                placeholder="Select highlights"
                valueKey="slug"
                labelKey="title"
                title="highlights"
              />
            </div>
            <div className="selector-group">
              <h3>User types</h3>
              <MultiSelectDropdown
                options={userTypes}
                selected={filteredUserTypes}
                onChange={filterHandler}
                placeholder="Select user types"
                valueKey="slug"
                labelKey="title"
                title="userTypes"
              />
            </div>
            <div className="selector-group">
              <h3>Occasions</h3>
              <MultiSelectDropdown
                options={occasions}
                selected={filteredOccasions}
                onChange={filterHandler}
                placeholder="Select occasions"
                valueKey="slug"
                labelKey="title"
                title="occasions"
              />
            </div>
            <div className="selector-group">
              <h3>Use cases</h3>
              <MultiSelectDropdown
                options={useCases}
                selected={filteredUseCases}
                onChange={filterHandler}
                placeholder="Select use cases"
                valueKey="slug"
                labelKey="title"
                title="useCases"
              />
            </div>

            {/* <div>
              <h3>Pricing</h3>
              <ul className="filter-list">{pricingList}</ul>
            </div>
            <div>
              <h3>Platforms</h3>
              <ul className="filter-list">{platformsList}</ul>
            </div>
            <div>
              <h3>Socials</h3>
              <ul className="filter-list">{socialsList}</ul>
            </div>
            <div>
              <h3>Other</h3>
              <ul className="filter-list">{otherList}</ul>
            </div> */}
          </div>
        </div>
        <Button
          secondary
          type="button"
          onClick={() => setShowFiltersContainer(!showFiltersContainer)}
          className="btn-filters"
        >
          X
        </Button>
      </section>
      {products.data ? (
        <section className="container-scroll">
          <InfiniteScroll
            dataLength={products.data.length}
            next={fetchApps}
            hasMore={products.hasMore} // Replace with a condition based on your data source
            loader={<p>Loading...</p>}
            endMessage={<p>No more data to load.</p>}
            className={`container-cards ${listView ? 'list' : 'grid'}`}
          >
            {products.data.map((product) => {
              return (
                <Card
                  listCard={listView}
                  id={product.id}
                  title={product.title}
                  description={product?.description}
                  url={product.url}
                  urlImage={product.url_image}
                  topic={product.categoryTitle}
                  topicId={product.categorySlug}
                  price={product.price}
                  currency={product.currency}
                  urlAffiliate={product.url_affiliate}
                  isFavorite={favorites.some((x) => x.id === product.id)}
                  addFavorite={(event) => addFavorite(product.id)}
                  deleteBookmark={() => handleDeleteBookmarks(product.id)}
                  bookmarkOnClick={() => {
                    setOpenModal(true);
                    setModalTitle('Sign up to add bookmarks');
                  }}
                  cardUrl={`/products/${product.slug}`}
                  rating={product.rating}
                  reviews={product.reviews}
                  discount={product.discount_percentage}
                  isoCode={product.countryIsoCode}
                />
              );
            })}
          </InfiniteScroll>
        </section>
      ) : (
        <Loading />
      )}
      <Modal title={modalTitle} open={openModal} toggle={toggleModal}>
        <Link to="/signup">
          <Button primary label="Create an account" />
        </Link>
        or
        <Link to="/login">
          <Button secondary label="Log in" />
        </Link>
      </Modal>
    </main>
  );
};
