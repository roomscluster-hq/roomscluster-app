export const PLAN_DETAILS = {
  FREE: {
    label: "Free",
    price: null,
    features: ["1 co-host per session", "Sessions up to 1 hour", "Audio recording (40 min per session)"],
  },
  PRO: {
    label: "Pro",
    price: "₦20,000/month",
    features: [
      "5 teammates",
      "2 co-hosts per session",
      "Sessions up to 3 hours",
      "Video recording (up to 2 hours)",
      "Groups, Enrollment & Member Portal",
    ],
  },
  BUSINESS: {
    label: "Business",
    price: "₦75,000/month",
    features: [
      "30 teammates",
      "5 co-hosts per session",
      "Sessions up to 5 hours",
      "Unlimited recording",
      "Simultaneous audio + video recording",
      "Custom subdomain & branding",
    ],
  },
} as const;