import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  product?: {
    name: string;
    price: number;
    originalPrice: number;
    brand: string;
    category: string;
    availability: string;
    sku: string;
    rating?: number;
    reviewCount?: number;
  };
  organization?: boolean;
  breadcrumbs?: { name: string; url: string }[];
}

const siteUrl = "https://gridox.in";
const siteName = "GriDox";
const defaultImage = `/logo.jpeg`;

export const SEO = ({
  title,
  description,
  keywords = "GriDox, GriDox Fashion, GriDox Clothing, GriDox Women's Wear, GriDox Ethnic Wear, GriDox Designer Collection, GriDox Boutique, GriDox Premium, GriDox Style, GriDox Dress",
  image = defaultImage,
  url,
  type = "website",
  product,
  organization = false,
  breadcrumbs,
}: SEOProps) => {
  const location = useLocation();
  const canonicalUrl = url ? `${siteUrl}${url}` : `${siteUrl}${location.pathname}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith("http") ? image : `${siteUrl}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith("http") ? image : `${siteUrl}${image}`} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content={siteName} />
      <meta name="language" content="English" />

      {/* Geo Tags for India (if applicable) */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />

      {/* Mobile & PWA */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
    </Helmet>
  );
};

// Organization Structured Data
export const OrganizationSchema = () => {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GriDox",
    url: "https://gridox.in",
    logo: "https://gridox.in/logo.jpeg",
    description: "GriDox - Premium designer women's fashion and clothing. Discover uniquely designed, high-quality dresses, ethnic wear, and contemporary styles by GriDox.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-11-41169005",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    sameAs: [
      "https://www.instagram.com/gridox",
      "https://www.facebook.com/gridox",
      "https://twitter.com/gridox",
    ],
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(organizationData)}
    </script>
  );
};

// Website Structured Data
export const WebSiteSchema = () => {
  const webSiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GriDox",
    url: "https://gridox.in",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://gridox.in/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(webSiteData)}
    </script>
  );
};

// Product Structured Data
export const ProductSchema = ({
  productData,
  categorySlug,
}: {
  productData: {
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    images: string[];
    fabric: string;
    colors: string[];
    sizes: string[];
    availability: string;
  };
  categorySlug: string;
}) => {
  const availabilityMap: { [key: string]: string } = {
    "In Stock": "https://schema.org/InStock",
    "Out of Stock": "https://schema.org/OutOfStock",
    "Pre-order": "https://schema.org/PreOrder",
    "Limited Availability": "https://schema.org/LimitedAvailability",
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productData.name,
    description: productData.description,
    image: productData.images.map((img) => (img.startsWith("http") ? img : `https://gridox.in${img}`)),
    sku: productData.name.toLowerCase().replace(/\s+/g, "-"),
    brand: {
      "@type": "Brand",
      name: "GriDox",
    },
    category: categorySlug,
    offers: {
      "@type": "Offer",
      price: productData.price,
      priceCurrency: "INR",
      availability: availabilityMap[productData.availability] || "https://schema.org/InStock",
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      seller: {
        "@type": "Organization",
        name: "GriDox",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "127",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Fabric",
        value: productData.fabric,
      },
      {
        "@type": "PropertyValue",
        name: "Colors",
        value: productData.colors.join(", "),
      },
      {
        "@type": "PropertyValue",
        name: "Sizes",
        value: productData.sizes.join(", "),
      },
    ],
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(productSchema)}
    </script>
  );
};

// Breadcrumb Structured Data
export const BreadcrumbSchema = ({
  items,
}: {
  items: { name: string; url: string }[];
}) => {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(breadcrumbData)}
    </script>
  );
};

// Category Page Structured Data
export const CategorySchema = ({
  categoryTitle,
  productCount,
  categorySlug,
}: {
  categoryTitle: string;
  productCount: number;
  categorySlug: string;
}) => {
  const categoryData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryTitle} | GriDox`,
    description: `Discover the latest ${categoryTitle} collection at GriDox. ${productCount} premium designer pieces.`,
    url: `${siteUrl}/category/${categorySlug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: productCount,
    },
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(categoryData)}
    </script>
  );
};
