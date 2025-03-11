"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";

export default function PromoCodeInput() {
  const [promoCode, setPromoCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { applyPromoCode } = useCart();

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setIsValidating(true);

    try {
      const response = await fetch("/api/validate-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promoCode: promoCode.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to validate promo code");
        return;
      }

      if (data.valid) {
        toast.success(
          data.promoData.notificationText || "Promo code applied successfully!"
        );
        applyPromoCode(data.promoData);
        setPromoCode("");
      } else {
        toast.error(data.error || "Invalid promo code");
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      toast.error("An error occurred while validating the promo code");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className='flex gap-2 mt-2'>
      <Input
        id='promoCode'
        type='text'
        placeholder='Enter promo code'
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
        className='bg-transparent text-white border border-white/20 placeholder:text-gray-400 focus:border-yellow focus:0'
        aria-label='Promo code'
        disabled={isValidating}
      />
      <button
        onClick={validatePromoCode}
        className='rounded-lg bg-yellow px-4 py-2 text-black transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400'
        disabled={isValidating}
      >
        {isValidating ? "Validating..." : "Apply"}
      </button>
    </div>
  );
}
