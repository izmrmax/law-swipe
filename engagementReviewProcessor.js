const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use(
  config => {
    // Consider using httpOnly cookies instead of localStorage for tokens to mitigate XSS risks
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

const getEngagementReviews = async engagementId => {
  if (!engagementId) {
    throw new Error('Engagement ID is required to fetch reviews');
  }
  try {
    const response = await apiClient.get(`/engagements/${engagementId}/reviews`);
    return response.data;
  } catch (error) {
    console.error('Error fetching engagement reviews:', error);
    const serverMessage =
      error.response?.data?.message ||
      (typeof error.response?.data === 'string' ? error.response.data : null);
    throw new Error(serverMessage || 'Failed to fetch engagement reviews');
  }
};

const submitEngagementReview = async (engagementId, { rating, comments }) => {
  if (!engagementId) {
    throw new Error('Engagement ID is required to submit a review');
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw new Error('Rating must be a number between 1 and 5');
  }
  const payload = {
    rating,
    comments: comments?.trim() || ''
  };
  try {
    const response = await apiClient.post(`/engagements/${engagementId}/reviews`, payload);
    return response.data;
  } catch (error) {
    console.error('Error submitting engagement review:', error);
    const serverMessage =
      error.response?.data?.message ||
      (typeof error.response?.data === 'string' ? error.response.data : null);
    throw new Error(serverMessage || 'Failed to submit engagement review');
  }
};

const aggregateReviews = reviews => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { count: 0, averageRating: 0, distribution: {} };
  }
  const count = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const averageRating = parseFloat((sum / count).toFixed(1));
  const distribution = reviews.reduce((dist, r) => {
    const key = r.rating || 0;
    dist[key] = (dist[key] || 0) + 1;
    return dist;
  }, {});
  return { count, averageRating, distribution };
};

const processEngagementReview = async (engagementId, reviewData) => {
  try {
    const submitted = await submitEngagementReview(engagementId, reviewData);
    const allReviews = await getEngagementReviews(engagementId);
    const stats = aggregateReviews(allReviews);
    return { submitted, stats };
  } catch (error) {
    // Preserve original message but wrap in Error for consistent typing
    throw new Error(error.message || 'Error processing engagement review');
  }
};

export {
  getEngagementReviews,
  submitEngagementReview,
  aggregateReviews,
  processEngagementReview
};