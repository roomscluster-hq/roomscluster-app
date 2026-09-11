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
      "3 teammates",
      "2 co-hosts per session",
      "Sessions up to 2 hours",
      "Video recording (up to 2 hours)",
      "Groups, Enrollment & Member Portal",
    ],
  },
  BUSINESS: {
    label: "Business",
    price: "₦85,000/month",
    features: [
      "10 teammates",
      "5 co-hosts per session",
      "Sessions up to 4 hours",
      "Unlimited recording",
      "Simultaneous audio + video recording",
      "Custom subdomain & branding",
    ],
  },
} as const;