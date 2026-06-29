/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '../../components/Button/Button.component';
import { ContainerCta } from '../../components/ContainerCta/ContainerCta.component';
import { Badge } from '../../components/Badge/Badge.component';
import { Card } from '../../components/Card/Card.component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '../../components/Modal/Modal.Component';
import iconCopy from '../../assets/images/icons8-copy-24.png';
import productStoreLogo from '../../assets/images/download-on-the-app-store-apple-logo.svg';
import googlePlayStoreLogo from '../../assets/images/google-play-badge-logo.svg';
import macLogo from '../../assets/images/macos.svg';
import windowsLogo from '../../assets/images/windows.svg';
import chromeLogo from '../../assets/images/chrome.png';
import mousePointer from '../../assets/images/mouse-pointer.svg';
import { Dropdown } from '../../components/Dropdown/Dropdown.Component';
import TextFormTextarea from '../../components/Input/TextFormTextarea.component';
import Toast from '../../components/Toast/Toast.Component';
import Markdown from 'markdown-to-jsx';
import { Loading } from '../../components/Loading/Loading.Component';
import { useLikes } from '../../utils/hooks/useLikes';
import { ThumbsUp, ThumbsDown, Globe } from 'lucide-react';
import Rating from '../../components/Rating/Rating.component';
import globe from '../../assets/images/globe.svg';
import { formatDuration } from '../../utils/formatDuration';
import { getFlagEmoji } from '../../utils/getFlagEmoji';

import {
  faEnvelope,
  faLink,
  faCaretUp,
  faArrowUpRightFromSquare,
  faHeart as faHeartSolid,
} from '@fortawesome/free-solid-svg-icons';
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faDiscord,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
} from 'react-share';
import appImage from '../../assets/images/app-placeholder.svg';
import { faHeart, faCopy } from '@fortawesome/free-regular-svg-icons';

import { apiURL } from '../../apiURL';
import './ProductView.styles.css';
import { useUserContext } from '../../userContext';
import { getMostUsedWords } from '../../utils/getMostUsedWords';
import { getDateFromTimestamp } from '../../utils/getDateFromTimestamp';

const faqConfig = [
  {
    key: 'faq_create_account',
    title: 'How to create an account in {product}?',
  },
  { key: 'faq_delete_account', title: 'How to delete {product} account?' },
  {
    key: 'faq_cancel_subscription',
    title: 'How to cancel subscription in {product}?',
  },
  {
    key: 'faq_change_profile_picture',
    title: 'How to change profile picture?',
  },
  { key: 'faq_log_in', title: 'How to log in to {product}?' },
  { key: 'faq_log_out', title: 'How to log out from {product}?' },
  {
    key: 'faq_is_product_on_android',
    title: 'Is {product} available on Android?',
  },
  {
    key: 'faq_product_doesnt_work_bugs',
    title: "{product} doesn't work, bugs",
  },
  { key: 'faq_is_safe_to_use', title: 'Is {product} safe to use?' },
  { key: 'faq_how_to_make_money', title: 'Can you make money with {product}?' },
  { key: 'faq_should_you_upgrade', title: 'Should you upgrade?' },
  { key: 'faq_can_use_for_free', title: '{product} for free?' },
];

export const ProductView = () => {
  const { slug } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [openToast, setOpenToast] = useState(false);
  const [animation, setAnimation] = useState('');
  const [id, setId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [topicsFromProducts, setTopicsFromProducts] = useState([]);
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [dealCodes, setDealCodes] = useState([]);
  // const [productProductStore, setProductProductStore] = useState({});
  // const [productProductStoreScraper, setProductProductStoreScraper] = useState(
  //   {},
  // );
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarProductsCountry, setSimilarProductsCountry] = useState([]);
  const [similarProductsArea, setSimilarProductsArea] = useState([]);
  const [similarProductsCity, setSimilarProductsCity] = useState([]);

  const [similarDealsFromProduct, setSimilarDealsFromProduct] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUserContext();
  const [validForm, setValidForm] = useState(false);
  const [invalidForm, setInvalidForm] = useState(false);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [allRatings, setAllRatings] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [searches, setSearches] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [openAddCodeForm, setOpenAddCodeForm] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [tags, setTags] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  // const {
  //   likes: positiveLikes,
  //   allLikes: allPositiveLikes,
  //   addLike: addPositiveLike,
  //   deleteLike: deletePositiveLike,
  // } = useLikes(user, 'positiveLikes');

  // const {
  //   likes: negativeLikes,
  //   allLikes: allNegativeLikes,
  //   addLike: addNegativeLike,
  //   deleteLike: deleteNegativeLike,
  // } = useLikes(user, 'negativeLikes');

  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    async function fetchSingleProduct(productId) {
      const response = await fetch(`${apiURL()}/products/${productId}`);
      const productResponse = await response.json();
      setProduct(productResponse[0]);
      setId(productResponse[0].id);
    }

    fetchSingleProduct(slug);
  }, [slug]);

  useEffect(() => {
    async function fetchTagsForProduct(productId) {
      const response = await fetch(`${apiURL()}/tags/?product=${productId}`);
      const data = await response.json();
      setTags(data);
    }

    async function fetchOccasionsForProduct(productId) {
      const response = await fetch(
        `${apiURL()}/occasions/?product=${productId}`,
      );
      const data = await response.json();
      setOccasions(data);
    }

    async function fetchHighlightsForProduct(productId) {
      const response = await fetch(
        `${apiURL()}/highlights/?product=${productId}`,
      );
      const data = await response.json();
      setHighlights(data);
    }

    async function fetchUseCasesForProduct(productId) {
      const response = await fetch(
        `${apiURL()}/useCases/?product=${productId}`,
      );
      const data = await response.json();
      setUseCases(data);
    }

    async function fetchUserTypesForProduct(productId) {
      const response = await fetch(
        `${apiURL()}/userTypes/?product=${productId}`,
      );
      const data = await response.json();
      setUserTypes(data);
    }

    // async function fetchCodesForADeal(dealId) {
    //   const response = await fetch(`${apiURL()}/codes/?deal=${dealId}`);
    //   const productResponse = await response.json();
    //   setDealCodes(productResponse);
    // }

    // async function fetchSearchesForADeal(dealId) {
    //   const response = await fetch(`${apiURL()}/searches/?deal=${dealId}`);
    //   const productResponse = await response.json();
    //   setSearches(productResponse);
    // }

    // async function fetchKeywordsForADeal(dealId) {
    //   const response = await fetch(`${apiURL()}/keywords/?deal=${dealId}`);
    //   const productResponse = await response.json();
    //   setKeywords(productResponse);
    // }

    // fetchSingleProduct(id);
    // fetchCodesForADeal(id);
    // fetchSearchesForADeal(id);
    // fetchKeywordsForADeal(id);

    const fetchData = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        await fetchTagsForProduct(id);
        await fetchOccasionsForProduct(id);
        await fetchHighlightsForProduct(id);

        await fetchUseCasesForProduct(id);
        await fetchUserTypesForProduct(id);
        // await fetchCodesForADeal(id);
        // await fetchSearchesForADeal(id);
        // await fetchKeywordsForADeal(id);
      } catch (e) {
        setError({ message: e.message || 'Failed to fetch data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // useEffect(() => {
  //   async function fetchProductProductStore(productleId) {
  //     setLoading(true);
  //     try {
  //       const response = await fetch(
  //         `${apiURL()}/productsProductStore/${productleId}`,
  //       );
  //       const example = await response.json();
  //       setProductProductStore(example.results[0]);
  //     } catch (e) {
  //       setError({ message: e.message || 'Failed to fetch data' });
  //     }
  //     setLoading(false);
  //   }
  //   product.productle_id && fetchProductProductStore(product.productle_id);
  // }, [product.productle_id]);

  // useEffect(() => {
  //   async function fetchProductProductStoreScraper(productleId) {
  //     setLoading(true);
  //     try {
  //       const response = await fetch(
  //         `${apiURL()}/productsProductStoreScraper/${productleId}`,
  //       );
  //       const data = await response.json();
  //       setProductProductStoreScraper(data);
  //     } catch (e) {
  //       setError({ message: e.message || 'Failed to fetch data' });
  //     }
  //     setLoading(false);
  //   }
  //   product.productle_id &&
  //     fetchProductProductStoreScraper(product.productle_id);
  // }, [product.productle_id]);

  // useEffect(() => {
  //   const faqArray = faqConfig
  //     .filter(({ key }) => product[key])
  //     .map(({ key, title }) => ({
  //       id: key,
  //       title: title.replace('{product}', product.title || 'this product'),
  //       text: product[key],
  //       open: false,
  //     }));

  //   setFaqs(faqArray);
  // }, [product]);

  useEffect(() => {
    async function fetchSimilarProducts() {
      setLoading(true);
      try {
        const response = await fetch(
          `${apiURL()}/products?page=0&column=rating&direction=desc&categories=${
            product.categorySlug
          }`,
        );
        const data = await response.json();

        const filteredData = data.data.filter((item) => item.id !== product.id);

        setSimilarProducts(filteredData);
      } catch (e) {
        setError({ message: e.message || 'Failed to fetch data' });
      }
      setLoading(false);
    }

    async function fetchSimilarProductsCountry() {
      setLoading(true);
      try {
        const response = await fetch(
          `${apiURL()}/products?page=0&column=rating&direction=desc&countries=${
            product.countrySlug
          }`,
        );
        const data = await response.json();
        const filteredData = data.data.filter((item) => item.id !== product.id);

        setSimilarProductsCountry(filteredData);
      } catch (e) {
        setError({ message: e.message || 'Failed to fetch data' });
      }
      setLoading(false);
    }

    async function fetchSimilarProductsArea() {
      setLoading(true);
      try {
        const response = await fetch(
          `${apiURL()}/products?page=0&column=rating&direction=desc&areas=${
            product.areaSlug
          }`,
        );
        const data = await response.json();
        const filteredData = data.data.filter((item) => item.id !== product.id);

        setSimilarProductsArea(filteredData);
      } catch (e) {
        setError({ message: e.message || 'Failed to fetch data' });
      }
      setLoading(false);
    }

    async function fetchSimilarProductsCity() {
      setLoading(true);
      try {
        const response = await fetch(
          `${apiURL()}/products?page=0&column=rating&direction=desc&cities=${
            product.citySlug
          }`,
        );
        const data = await response.json();
        const filteredData = data.data.filter((item) => item.id !== product.id);

        setSimilarProductsCity(filteredData);
      } catch (e) {
        setError({ message: e.message || 'Failed to fetch data' });
      }
      setLoading(false);
    }

    fetchSimilarProducts();
    fetchSimilarProductsCountry();
    fetchSimilarProductsArea();
    fetchSimilarProductsCity();
  }, [
    product.id,
    product.categorySlug,
    product.countrySlug,
    product.citySlug,
    product.areaSlug,
  ]);

  const fetchCommentsByProductId = useCallback(async (productId) => {
    const response = await fetch(`${apiURL()}/comments?productId=${productId}`);
    const commentResponse = await response.json();
    setComments(commentResponse);
  }, []);

  useEffect(() => {
    fetchCommentsByProductId(id);
  }, [fetchCommentsByProductId, id]);

  const navigateBack = () => {
    navigate(-1);
  };

  const addComment = async (commentContent) => {
    const response = await fetch(`${apiURL()}/comments`, {
      method: 'POST',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: commentContent,
        product_id: id,
      }),
    });
    if (response.ok) {
      fetchCommentsByProductId(id);
    }
  };

  const commentHandler = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!comment) {
      setCommentError('Comment is required!');
      setInvalidForm(true);
      setValidForm(false);
      return;
    }
    if (comment.trim().length < 5) {
      setCommentError('Comment must be more than five characters!');
      setInvalidForm(true);
      setValidForm(false);
      return;
    }

    setInvalidForm(false);
    setValidForm(true);
    addComment(comment);
    setOpenConfirmationModal(true);
    setComment('');
  };
  const getOnlyYearMonthDay = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const results = [];
      const combinedText = `${product?.title} ${product?.description} ${product?.descriptionChatGpt}`;
      const words = getMostUsedWords(combinedText, 10);

      for (const [word] of words) {
        try {
          const res = await fetch(
            `${apiURL()}/products?page=0&column=id&direction=desc&search=${encodeURIComponent(
              word,
            )}`,
          );
          const data = await res.json();
          if (data.data.length > 1) {
            const wordWithLink = {
              title: word,
              url: `products/search/${word}`,
            };
            results.push(wordWithLink);
          }
        } catch (err) {
          return;
        }
      }

      setTopicsFromProducts(results);
      setLoading(false);
    }
    if (product?.title) {
      fetchData();
    }
  }, [product?.description, product?.descriptionChatGpt, product?.title]);

  const cardItems = similarProducts.map((item) => {
    // const relatedTopics = topics
    //   .filter((topic) => topic.categoryId === category.id)
    //   .map((item) => item.id);
    return (
      <Card
        id={item.id}
        cardUrl={`/products/${item.slug}`}
        title={item.title}
        price={item.price}
        currency={item.currency}
        urlAffiliate={item.url_affiliate}
        description={item.description}
        url={item.url}
        urlImage={item.url_image}
        topic={item.categoryTitle}
        productTitle={item.productTitle}
        rating={item.rating}
        reviews={item.reviews}
        isoCode={item.countryIsoCode}
      />
    );
  });

  const cardItemsCountry = similarProductsCountry.map((item) => {
    // const relatedTopics = topics
    //   .filter((topic) => topic.categoryId === category.id)
    //   .map((item) => item.id);
    return (
      <Card
        id={item.id}
        cardUrl={`/products/${item.slug}`}
        title={item.title}
        price={item.price}
        currency={item.currency}
        urlAffiliate={item.url_affiliate}
        description={item.description}
        url={item.url}
        urlImage={item.url_image}
        topic={item.categoryTitle}
        productTitle={item.productTitle}
        rating={item.rating}
        reviews={item.reviews}
        isoCode={item.countryIsoCode}
      />
    );
  });

  const cardItemsArea = similarProductsArea.map((item) => {
    // const relatedTopics = topics
    //   .filter((topic) => topic.categoryId === category.id)
    //   .map((item) => item.id);
    return (
      <Card
        id={item.id}
        cardUrl={`/products/${item.slug}`}
        title={item.title}
        price={item.price}
        currency={item.currency}
        urlAffiliate={item.url_affiliate}
        description={item.description}
        url={item.url}
        urlImage={item.url_image}
        topic={item.categoryTitle}
        productTitle={item.productTitle}
        rating={item.rating}
        reviews={item.reviews}
        isoCode={item.countryIsoCode}
      />
    );
  });

  const cardItemsCity = similarProductsCity.map((item) => {
    // const relatedTopics = topics
    //   .filter((topic) => topic.categoryId === category.id)
    //   .map((item) => item.id);
    return (
      <Card
        id={item.id}
        cardUrl={`/products/${item.slug}`}
        title={item.title}
        price={item.price}
        currency={item.currency}
        urlAffiliate={item.url_affiliate}
        description={item.description}
        url={item.url}
        urlImage={item.url_image}
        topic={item.categoryTitle}
        productTitle={item.productTitle}
        rating={item.rating}
        reviews={item.reviews}
        isoCode={item.countryIsoCode}
      />
    );
  });

  // const cardItemsSimilarDealsFromProduct = similarDealsFromProduct.map((item) => {
  //   return (
  //     <Card
  //       id={item.id}
  //       cardUrl={`/products/${item.id}`}
  //       title={item.title}
  //       description={item.description}
  //       url={item.url}
  //       urlImage={item.url_image === null ? 'deal' : item.url_image}
  //       topic={item.topicTitle}
  //       productTitle={item.productTitle}
  //       smallCard
  //     />
  //   );
  // });

  const searchItems = searches.map((search) => {
    return (
      <Link to={`../../products/searchterm/${search.id}`} target="_blank">
        <Button
          size="medium"
          secondary
          icon={<FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" />}
          label={search.title}
        />
      </Link>
    );
  });

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

  const toggleModal = () => {
    setOpenModal(false);
    document.body.style.overflow = 'visible';
  };

  const fetchAllRatings = useCallback(async () => {
    const url = `${apiURL()}/ratings`;
    const response = await fetch(url);
    const ratingsData = await response.json();
    setAllRatings(ratingsData);
  }, []);

  useEffect(() => {
    fetchAllRatings();
  }, [fetchAllRatings]);

  const fetchRatings = useCallback(async () => {
    const url = `${apiURL()}/ratings`;
    const response = await fetch(url, {
      headers: {
        token: `token ${user?.uid}`,
      },
    });
    const ratingsData = await response.json();

    if (Array.isArray(ratingsData)) {
      setRatings(ratingsData);
    } else {
      setRatings([]);
    }
  }, [user]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const addRating = async (productId) => {
    const response = await fetch(`${apiURL()}/ratings`, {
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
      fetchRatings();
      fetchAllRatings();
    }
  };

  const deleteRating = async (productId) => {
    const response = await fetch(`${apiURL()}/ratings/${productId}`, {
      method: 'DELETE',
      headers: {
        token: `token ${user?.uid}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      fetchRatings();
      fetchAllRatings();
    }
  };

  const copyToClipboard = (item) => {
    navigator.clipboard.writeText(item);
    setOpenToast(true);
    setAnimation('open-animation');

    setTimeout(() => {
      setAnimation('close-animation');
    }, 2000);
    setTimeout(() => {
      setOpenToast(false);
    }, 2500);
  };

  const dealCodesInTitle = dealCodes.map((i) => {
    return `(${i.title})`;
  });

  const showNumberOfCodesInTitle = (codes) => {
    let title;
    if (codes.length === 1) {
      title = 'code';
    } else {
      title = 'codes';
    }

    return `${codes.length} ${title}`;
  };

  // const images = [
  //   {
  //     original: 'https://picsum.photos/id/1018/1000/600/',
  //     thumbnail: 'https://picsum.photos/id/1018/250/150/',
  //   },
  //   {
  //     original: 'https://picsum.photos/id/1015/300/600/',
  //     thumbnail: 'https://picsum.photos/id/1015/150/450/',
  //   },
  //   {
  //     original: 'https://picsum.photos/id/1019/1000/600/',
  //     thumbnail: 'https://picsum.photos/id/1019/250/150/',
  //   },
  // ];

  // if (loading) {
  //   return (
  //     <>
  //       <Helmet>
  //         <title>Loading...</title>
  //         <meta name="description" content="Fetching deal details" />
  //       </Helmet>
  //       <main className="loading-container">
  //         <Loading />
  //       </main>
  //     </>
  //   );
  // }

  const handleFaqs = (faqId) => {
    setFaqs(
      faqs.map((item) => {
        if (item.id === faqId) {
          return { ...item, open: !item.open };
        }
        return item;
      }),
    );
  };

  const discount = product.discount_percentage || 0;

  // Calculate original price
  const originalPrice =
    discount > 0 ? product.price / (1 - discount / 100) : product.price;

  const descriptionText = (
    product.description ||
    product.summary ||
    product.description_ai ||
    'No description available'
  )
    .replace(/\*+/g, '')
    .trim();

  function getPriceValidUntil(days = 30) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // usage
  const priceValidUntil = getPriceValidUntil(30);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.url_image,
    description: descriptionText,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Book Travel Activities',
    },
    offers: {
      '@type': 'Offer',
      url: `https://www.booktravelactivities.com/products/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      availability: `https://schema.org/InStock`,
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews || 0,
      },
    }),
  };

  // 2️⃣ Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.booktravelactivities.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: 'https://www.booktravelactivities.com/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `https://www.booktravelactivities.com/products/${product.slug}`,
      },
    ],
  };

  const faqsItems = faqs.map((faq) => {
    return (
      <div key={faq.id}>
        <h3 className="h3-faq" onClick={() => handleFaqs(faq.id)}>
          {faq.title} {faq.open ? '▲' : '▼'}
        </h3>
        <p className={!faq.open && 'faq-closed'}>{faq.text}</p>
      </div>
    );
  });

  const isBestseller = Boolean(Number(product.bestseller));

  if (error) {
    return (
      <>
        <Helmet>
          <title>Error</title>
          <meta name="description" content="Something went wrong" />
        </Helmet>
        <main className="error-container">
          <h2>{error.message || 'Something went wrong'}</h2>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${product?.title} - Book Travel Activities`}</title>
        <meta
          name="description"
          content={
            product.meta_description ||
            `${product?.title} - reviews, deals, discounts.`
          }
        />
        {/* Canonical URL */}
        <link
          rel="canonical"
          href={`https://www.booktravelactivities.com/products/${product.slug}`}
        />
        {/* Robots meta for large image preview (Google Discover) */}
        <meta name="robots" content="max-image-preview:large" />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.title} />
        <meta
          property="og:description"
          content={product.meta_description || descriptionText}
        />
        <meta property="og:image" content={product.url_image} />
        <meta
          property="og:url"
          content={`https://www.booktravelactivities.com/products/${product.slug}`}
        />
        <meta property="og:site_name" content="Book Travel Activities" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.title} />
        <meta
          name="twitter:description"
          content={product.meta_description || descriptionText}
        />
        <meta name="twitter:image" content={product.url_image} />

        {/* Rich content */}
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      <main>
        <section className="container-appview">
          <div className="header">
            <h1 className="hero-header">{product?.title}</h1>
          </div>
          {product.url_image && (
            <div className="activity-img-container">
              <img
                className="appview-image-activities"
                alt={product.image_alt_text || product.title}
                src={product.url_image}
              />
              {product.image_credit && <span>{product.image_credit}</span>}
            </div>
          )}
          {!product.url_image && product.countryIsoCode && (
            <span className="img-emoji">
              {getFlagEmoji(product.countryIsoCode)}
            </span>
          )}

          {/* {product.url_image && (
            <div
              style={{
                backgroundImage: `url(${product.url_image})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}
            ></div>
          )} */}
          {/* {product.url_image && (
            <img
              className="appview-icon default-icon"
              alt={`${product.title}`}
              src={product.url_image || mousePointer}
            />
          )} */}
          {/* <span className="img-emoji">🌍</span>
          <Globe size="15rem" className="appview-icon default-icon" /> */}

          {/* <img
            className={`appview-icon ${!product.url_icon && 'default-icon'}`}
            alt={`${product.title}`}
            src={product.url_icon || mousePointer}
          /> */}

          {/* <ImageGallery items={images} /> */}
          <div className="rating-price-group">
            {product.rating && (
              <Rating rating={product.rating} reviews={product.reviews} />
            )}
            {product.price && (
              <div className="price-group">
                {isBestseller && (
                  <div>
                    <Badge
                      backgroundColor="#e53935"
                      size="small"
                      label="Bestseller"
                    />
                  </div>
                )}
                {/* Discount */}
                <div className="from-discount-group">
                  <span className="price-label">From</span>
                  {discount > 0 && (
                    <span className="original-price">
                      {product.currency === 'USD' && '$ '}
                      {product.currency === 'EUR' && '€ '}
                      {Math.floor(originalPrice)}.
                      {originalPrice.toFixed(2).split('.')[1]}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="discount">-{discount}%</span>
                  )}
                </div>
                {/* Original price */}
                <div className="price">
                  {product.currency === 'USD' && (
                    <span className="currency">$</span>
                  )}
                  {product.currency === 'EUR' && (
                    <span className="currency">€</span>
                  )}
                  <span className="amount">
                    {Math.floor(parseFloat(product.price))}
                  </span>
                  <span className="cents">
                    {parseFloat(product.price).toFixed(2).split('.')[1]}
                  </span>
                  {/* Show original price crossed if discount exists */}
                </div>
              </div>
            )}
          </div>
          <div className="container-deal-actions">
            <div className="container-appview-buttons">
              {product.url_affiliate && (
                <Link to={product.url_affiliate} target="_blank">
                  <Button
                    fourth
                    size="large"
                    icon={
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        size="sm"
                      />
                    }
                    label="Book Now"
                  />
                </Link>
              )}
            </div>
            <div className="container-rating">
              Rating
              {user &&
              allRatings.some((rating) => rating.product_id === product.id) &&
              ratings.some((rating) => rating.id === product.id) ? (
                <button
                  type="button"
                  className="button-rating"
                  onClick={(event) => deleteRating(product.id)}
                >
                  <FontAwesomeIcon icon={faCaretUp} />
                  {
                    allRatings.filter(
                      (rating) => rating.product_id === product.id,
                    ).length
                  }
                </button>
              ) : user ? (
                <button
                  type="button"
                  className="button-rating"
                  onClick={(event) => addRating(product.id)}
                >
                  <FontAwesomeIcon icon={faCaretUp} />
                  {
                    allRatings.filter(
                      (rating) => rating.product_id === product.id,
                    ).length
                  }
                </button>
              ) : (
                <button
                  type="button"
                  className="button-rating"
                  onClick={() => {
                    setOpenModal(true);
                    setModalTitle('Sign up to vote');
                  }}
                >
                  <FontAwesomeIcon icon={faCaretUp} />
                  {
                    allRatings.filter(
                      (rating) => rating.product_id === product.id,
                    ).length
                  }
                </button>
              )}
            </div>

            <div>
              {user && favorites.some((x) => x.id === product.id) ? (
                <button
                  type="button"
                  onClick={() => handleDeleteBookmarks(product.id)}
                  onKeyDown={() => handleDeleteBookmarks(product.id)}
                  className="button-bookmark"
                >
                  Remove product from saved &nbsp;
                  <FontAwesomeIcon icon={faHeartSolid} size="lg" />
                </button>
              ) : user ? (
                <button
                  type="button"
                  onClick={() => addFavorite(product.id)}
                  onKeyDown={() => addFavorite(product.id)}
                  className="button-bookmark"
                >
                  Save this product &nbsp;
                  <FontAwesomeIcon icon={faHeart} size="lg" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOpenModal(true);
                    setModalTitle('Sign up to add bookmarks');
                  }}
                  onKeyDown={() => addFavorite(product.id)}
                  className="button-bookmark"
                >
                  Save <FontAwesomeIcon icon={faHeart} size="lg" />
                </button>
              )}
            </div>
          </div>
          {/* <div className="container-details container-badges">
            <h2 className="no-margin">Pricing</h2>
            <div className="container-tags">
              <div className="badges">
                <div className="badges-keywords">
                  {!!product.pricing_free && (
                    <Link to="../products/pricing/free">
                      <Button secondary label="free" size="small" />
                    </Link>
                  )}
                  {!!product.pricing_freemium && (
                    <Link to="../products/pricing/freemium">
                      <Button secondary label="freemium" size="small" />
                    </Link>
                  )}
                  {!!product.pricing_subscription && (
                    <Link to="../products/pricing/subscription">
                      <Button secondary label="subscription" size="small" />
                    </Link>
                  )}
                  {!!product.pricing_one_time && (
                    <Link to="../products/pricing/one-time">
                      <Button secondary label="one-time" size="small" />
                    </Link>
                  )}
                  {!!product.pricing_trial_available && (
                    <Link to="../products/pricing/trial">
                      <Button secondary label="trial" size="small" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <div className="container-tags">
              <div className="badges">
                <p className="p-no-margin">iOS product: </p>
                <div className="badges-keywords">
                  {!!product.pricing_ios_product_free && (
                    <Link to="../products/pricing/ios-free">
                      <Button secondary label="free" size="small" />
                    </Link>
                  )}
                  {!!product.pricing_ios_product_paid && (
                    <Link to="../products/pricing/ios-paid">
                      <Button secondary label="paid" size="small" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            {!!product.pricing_ios_product_paid &&
              product.price > 0 &&
              `${product.price} ${product.currency}`}
            {product.pricing_details && (
              <p className="p-no-margin">{product.pricing_details}</p>
            )}
            {product.pricing_url && (
              <div>
                <Link target="_blank" to={product.pricing_url}>
                  <span className="underline">Pricing page</span>{' '}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="sm" />
                </Link>
              </div>
            )}
          </div> */}
          <div className="container-description">
            <div className="container-title">
              <h2>{product.title}</h2>
            </div>
            {product.summary && (
              <>
                <h3>Summary</h3>
                <p className="product-description main-description">
                  <Markdown>{product.summary}</Markdown>
                </p>
              </>
            )}
            {(product.description || product.description_ai) && (
              <>
                <h3>Description</h3>
                {product.description && (
                  <p className="product-description main-description">
                    <Markdown>{product.description}</Markdown>
                  </p>
                )}
                {product.description_ai && (
                  <>
                    <h3>AI summary</h3>
                    <p className="product-description main-description">
                      <Markdown>{product.description_ai}</Markdown>
                    </p>
                  </>
                )}
              </>
            )}
            {product.whats_included && (
              <>
                <h3>What is included</h3>
                <p className="product-description main-description">
                  <Markdown>{product.whats_included}</Markdown>
                </p>
              </>
            )}
            {product.whats_excluded && (
              <>
                <h3>What is excluded</h3>
                <p className="product-description main-description">
                  <Markdown>{product.whats_excluded}</Markdown>
                </p>
              </>
            )}
          </div>

          {/* <div className="container-codes">
            {dealCodes.length > 0 ? (
              <>
                <div className="container-title">
                  <h2>
                    {product.title} -{' '}
                    {dealCodes.length > 0
                      ? `${showNumberOfCodesInTitle(dealCodes)}`
                      : ''}
                  </h2>
                </div>

                <div className="container-appview-codes-users">
                  {dealCodes.map((code) => {
                    const positiveLikesCount = allPositiveLikes.filter(
                      (like) => like.code_id === code.id,
                    ).length;

                    const negativeLikesCount = allNegativeLikes.filter(
                      (like) => like.code_id === code.id,
                    ).length;

                    return (
                      <div className="container-codes-users">
                        <div className="container-appview-codes">
                          <Button
                            size="medium"
                            primary
                            icon={<FontAwesomeIcon icon={faCopy} />}
                            label={code.title}
                            onClick={() => copyToClipboard(code.title)}
                          />
                          <Toast
                            open={openToast}
                            overlayClass={`toast ${animation}`}
                          >
                            <span>Copied to clipboard!</span>
                          </Toast>
                          {code.url && (
                            <Link to={code.url} target="_blank">
                              <Button
                                size="medium"
                                secondary
                                icon={
                                  <FontAwesomeIcon
                                    icon={faArrowUpRightFromSquare}
                                    size="sm"
                                  />
                                }
                                label="Link"
                              />
                            </Link>
                          )}
                          <Link to={`../../codes/${code.id}`} target="_blank">
                            <Button
                              size="medium"
                              secondary
                              icon={
                                <FontAwesomeIcon
                                  icon={faArrowUpRightFromSquare}
                                  size="sm"
                                />
                              }
                              label="View"
                            />
                          </Link>
                          <div className="container-rating">
                            {user &&
                            positiveLikes.some(
                              (like) => like.id === code.id,
                            ) ? (
                              <div className="thumbs-container up">
                                <ThumbsUp
                                  className="thumbs"
                                  color="green"
                                  size={20}
                                  onClick={() => deletePositiveLike(code.id)}
                                />
                                {positiveLikesCount}
                              </div>
                            ) : user ? (
                              <div className="thumbs-container up">
                                <ThumbsUp
                                  color="green"
                                  className="thumbs"
                                  size={20}
                                  onClick={() => addPositiveLike(code.id)}
                                />
                                {positiveLikesCount}
                              </div>
                            ) : (
                              <div className="thumbs-container up">
                                <ThumbsUp
                                  className="thumbs"
                                  size={20}
                                  color="green"
                                  onClick={() => {
                                    setOpenModal(true);
                                    setModalTitle('Sign up to vote');
                                  }}
                                />
                                {positiveLikesCount}
                              </div>
                            )}
                          </div>
                          <div className="container-rating">
                            {user &&
                            negativeLikes.some(
                              (like) => like.id === code.id,
                            ) ? (
                              <div className="thumbs-container down">
                                <ThumbsDown
                                  className="thumbs"
                                  color="red"
                                  size={20}
                                  onClick={() => deleteNegativeLike(code.id)}
                                />
                                {negativeLikesCount}
                              </div>
                            ) : user ? (
                              <div className="thumbs-container down">
                                <ThumbsDown
                                  color="red"
                                  className="thumbs"
                                  size={20}
                                  onClick={() => addNegativeLike(code.id)}
                                />
                                {negativeLikesCount}
                              </div>
                            ) : (
                              <div className="thumbs-container down">
                                <ThumbsDown
                                  className="thumbs"
                                  size={20}
                                  color="red"
                                  onClick={() => {
                                    setOpenModal(true);
                                    setModalTitle('Sign up to vote');
                                  }}
                                />
                                {negativeLikesCount}
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="codes-added-by">
                          added by {code.userFullName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="container-title">
                <span>
                  <i>No codes yet</i> 😢 <i>Add your code now!</i>
                </span>
              </div>
            )}
          </div> */}
          {/* {!user && (
            <div className="container-details cta">
              <div>
                <h2>🔥 Add your product!</h2>
                <p>Create an account to get started for free</p>
              </div>
              <div>
                <Link target="_blank" to="/signup">
                  <Button primary label="Create my account 👌" />
                </Link>
              </div>
            </div>
          )} */}
          <div className="container-comments">
            <h2 className="h-no-margin h-no-margin-bottom">Comments</h2>
            {comments.length === 0 && (
              <div>
                <i>No comments yet. </i>
                {user && <i>Add a first one below.</i>}
              </div>
            )}
            {comments.length > 0 &&
              comments.map((item) => (
                <div className="form-container">
                  <div className="comment-box submit-box-new-comment">
                    <div>{item.content}</div>
                    <div className="comment-author-date">{`by ${
                      item.full_name
                    } on ${getOnlyYearMonthDay(item.created_at)}`}</div>
                  </div>
                </div>
              ))}
            {!user && (
              <div>
                <i>
                  <br />
                  <Link to="/signup" className="simple-link">
                    Sign up
                  </Link>{' '}
                  or{' '}
                  <Link to="/login" className="simple-link">
                    log in
                  </Link>{' '}
                  to add comments
                </i>
              </div>
            )}
            {user && (
              <div className="form-container">
                <div className="comment-box submit-box">
                  <form onSubmit={handleSubmit}>
                    <textarea
                      className="form-input textarea-new-comment"
                      value={comment}
                      placeholder="Your comment..."
                      onChange={commentHandler}
                    />

                    <Button
                      primary
                      className="btn-add-prompt"
                      type="submit"
                      label="Add comment"
                    />
                    {validForm && (
                      <Modal
                        title="Your comment has been submitted!"
                        open={openConfirmationModal}
                        toggle={() => setOpenConfirmationModal(false)}
                      />
                    )}
                    {invalidForm && (
                      <p className="error-message">{commentError}</p>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
          {/* <div className="container-details container-badges">
            <h2 className="no-margin">Reviews</h2>
          </div> */}
          <div className="container-details container-badges">
            <h2 className="no-margin">Additional info</h2>
            {product.duration && (
              <div className="container-tags">
                <div className="badges">
                  <p>Duration: </p>
                  <div>{formatDuration(product.duration)}</div>
                </div>
              </div>
            )}
            {product.wheelchair_access && (
              <div className="container-tags">
                <div className="badges">
                  <p>Wheelchair access: </p>
                  <div>{product.wheelchair_access ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}
            {product.smartphone_ticket && (
              <div className="container-tags">
                <div className="badges">
                  <p>Smartphone ticket: </p>
                  <div>{product.smartphone_ticket ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}
            {product.private_tour !== undefined && (
              <div className="container-tags">
                <div className="badges">
                  <p>Private tour: </p>
                  <div>{product.private_tour ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}
            {product.free_cancellation !== undefined && (
              <div className="container-tags">
                <div className="badges">
                  <p>Free cancellation: </p>
                  <div>{product.free_cancellation ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}
            {product.likely_to_sell_out !== undefined && (
              <div className="container-tags">
                <div className="badges">
                  <p>Likely to sell out: </p>
                  <div>{product.likely_to_sell_out ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}
            {product.instant_confirmation !== undefined && (
              <div className="container-tags">
                <div className="badges">
                  <p>Instant confirmation: </p>
                  <div>{product.instant_confirmation ? 'Yes' : 'No'}</div>
                </div>
              </div>
            )}
          </div>
          <div className="container-details container-badges">
            <h2 className="no-margin">Location</h2>
            {product.address && (
              <div className="container-tags">
                <div className="badges">
                  <p>Address: </p>
                  <div>{product.address}</div>
                </div>
              </div>
            )}
            {product.postal_code && (
              <div className="container-tags">
                <div className="badges">
                  <p>Postal code: </p>
                  <div>{product.postal_code}</div>
                </div>
              </div>
            )}
            {(product.geolocation_lat || product.geolocation_lng) && (
              <>
                {product.geolocation_lat && (
                  <div className="container-tags">
                    <div className="badges">
                      <p>Latitude: </p>
                      <div>{product.geolocation_lat}</div>
                    </div>
                  </div>
                )}
                {product.geolocation_lng && (
                  <div className="container-tags">
                    <div className="badges">
                      <p>Longitude: </p>
                      <div>{product.geolocation_lng}</div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="container-tags">
              <div className="badges">
                <p>Country: </p>
                <div>
                  <Link to={`/products/countries/${product.countrySlug}`}>
                    <Button
                      secondary
                      label={product.countryTitle?.toLowerCase()}
                      size="small"
                    />
                  </Link>
                </div>
              </div>
            </div>
            {product.areaSlug && (
              <div className="container-tags">
                <div className="badges">
                  <p>Region/Area: </p>
                  <div>
                    <Link to={`/products/areas/${product.areaSlug}`}>
                      <Button
                        secondary
                        label={product.areaTitle?.toLowerCase()}
                        size="small"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <div className="container-tags">
              <div className="badges">
                <p>City: </p>
                <div>
                  <Link to={`/products/cities/${product.citySlug}`}>
                    <Button
                      secondary
                      label={product.cityTitle?.toLowerCase()}
                      size="small"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="container-details container-badges">
            <h2 className="no-margin">Category & tags</h2>
            <div className="container-tags">
              <div className="badges">
                <p>Category: </p>
                <div>
                  <Link to={`/products/categories/${product.categorySlug}`}>
                    <Button
                      secondary
                      label={product.categoryTitle?.toLowerCase()}
                      size="small"
                    />
                  </Link>
                </div>
              </div>
            </div>
            {topicsFromProducts.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Related topics: </p>
                  <div className="badges-keywords">
                    {topicsFromProducts.map((topic, index) => (
                      <Link to={`../../${topic.url}`}>
                        <Button secondary label={topic.title} size="small" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tags.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Tags: </p>
                  <div className="badges-keywords">
                    {tags.map((tag) => (
                      <Link to={`../products/tags/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="container-details container-badges">
            <h2 className="no-margin">Highlights & use cases</h2>
            {highlights.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Highlights: </p>
                  <div className="badges-keywords">
                    {highlights.map((tag) => (
                      <Link to={`../products/highlights/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {useCases.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Use cases: </p>
                  <div className="badges-keywords">
                    {useCases.map((tag) => (
                      <Link to={`../products/useCases/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="container-details container-badges">
            <h2 className="no-margin">For who and when</h2>

            {userTypes.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Best for: </p>
                  <div className="badges-keywords">
                    {userTypes.map((tag) => (
                      <Link to={`../products/userTypes/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {occasions.length > 0 && (
              <div className="container-tags">
                <div className="badges">
                  <p className="p-no-margin">Occasions: </p>
                  <div className="badges-keywords">
                    {occasions.map((tag) => (
                      <Link to={`../products/occasions/${tag.slug}`}>
                        <Button
                          secondary
                          label={tag.title.toLowerCase()}
                          size="small"
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* <div className="container-related-searches">
            <h3>Related searches</h3>
            <div className="topics-div searches">
              {searches.map((search) => (
                <Link to={`/products/search/${search.id}`} target="_blank">
                  <Button secondary label={search.title} />
                </Link>
              ))}
            </div>
          </div> */}
          <div className="icons-apps-page">
            <span>Share it: </span>
            <FontAwesomeIcon
              icon={faLink}
              className="button-copy"
              onClick={() =>
                copyToClipboard(
                  `https://www.booktravelactivities.com/products/${product.slug}`,
                )
              }
            />
            <FacebookShareButton url={`/products/${product.slug}`}>
              <FontAwesomeIcon className="share-icon" icon={faFacebookF} />
            </FacebookShareButton>
            <TwitterShareButton
              url={`https://www.booktravelactivities.com/products/${product.slug}`}
              title={`Check out this product: '${product.title}'`}
              hashtags={['Products']}
            >
              <FontAwesomeIcon className="share-icon" icon={faTwitter} />
            </TwitterShareButton>
            <LinkedinShareButton
              url={`https://www.booktravelactivities.com/products/${product.slug}`}
            >
              <FontAwesomeIcon className="share-icon" icon={faLinkedinIn} />
            </LinkedinShareButton>
            <EmailShareButton
              subject="Check out this product!"
              body={`This product is great: '${product.title}'`}
              url={`https://www.booktravelactivities.com/products/${product.slug}`}
            >
              <FontAwesomeIcon icon={faEnvelope} />
            </EmailShareButton>
            <Toast open={openToast} overlayClass={`toast ${animation}`}>
              <span>Copied to clipboard!</span>
            </Toast>
          </div>
          {/* <ContainerCta user={user} /> */}
          {/* {similarDealsFromProduct.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Other deals from {product.productTitle} product</h2>
              <div className="container-cards small-cards">
                {cardItemsSimilarDealsFromProduct}
              </div>
            </div>
          )} */}
          {similarProducts.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Similar activities in {product.categoryTitle}</h2>
              <div className="container-cards small-cards">{cardItems}</div>
            </div>
          )}
          {similarProductsCity.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Activities in {product.cityTitle}</h2>
              <div className="container-cards small-cards">{cardItemsCity}</div>
            </div>
          )}
          {similarProductsArea.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Activities in {product.areaTitle}</h2>
              <div className="container-cards small-cards">{cardItemsArea}</div>
            </div>
          )}
          {similarProductsCountry.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Activities in {product.countryTitle}</h2>
              <div className="container-cards small-cards">
                {cardItemsCountry}
              </div>
            </div>
          )}
          {/* {searches.length > 0 && (
            <div className="container-alternatives">
              <h2>🔎 Related searches</h2>
              <div className="container-related-searches">{searchItems}</div>
            </div>
          )} */}
        </section>
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
    </>
  );
};
