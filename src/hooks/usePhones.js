import { useEffect, useState } from "react";
import { listPhones } from "../lib/phones.js";
import { appwriteConfigured } from "../lib/appwrite.js";
import { samplePhones } from "../data/samplePhones.js";

export default function usePhones() {
  const [phones, setPhones] = useState(appwriteConfigured ? [] : samplePhones);
  const [loading, setLoading] = useState(appwriteConfigured);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appwriteConfigured) return;
    listPhones()
      .then(setPhones)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { phones, loading, error };
}
