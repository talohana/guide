import { useSubscription } from "@apollo/client";
import { Snackbar } from "@material-ui/core";
import get from "lodash.get";
import React, { useState } from "react";
import { ON_REVIEW_CREATED_SUBSCRIPTION } from "../graphql/Review";

export const ReviewCreatedNotification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useSubscription(ON_REVIEW_CREATED_SUBSCRIPTION, {
    onSubscriptionData: () => {
      setIsOpen(true);
      setTimeout(() => setIsOpen(false), 5000);
    },
  });

  const review = get(data, "reviewCreated");

  return review ? (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      open={isOpen}
      onClose={() => setIsOpen(false)}
      message={`New review from ${review.author.name}: ${review.text}`}
    />
  ) : null;
};
