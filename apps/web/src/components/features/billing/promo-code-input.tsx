"use client";

import { useState, type ReactElement } from "react";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Box, Button, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { Surface } from "@/components/ui/layout/surface";

interface PromoCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function PromoCodeInput(props: PromoCodeInputProps): ReactElement {
  const { value, onChange, onClear, disabled } = props;
  const [promoCode, setPromoCode] = useState(value);

  const apply = () => {
    onChange(promoCode);
  };

  return (
    <Surface padding={2.5} sx={{ maxWidth: 480 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <TextField
          label="Promotion code"
          placeholder="LAUNCH50"
          fullWidth
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.trim().toUpperCase())}
          disabled={disabled}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOfferIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          helperText={
            value
              ? `Applied: ${value}. Validated at checkout.`
              : "Optional. Enter a code to pre-apply a discount."
          }
        />
        {value ? (
          <Tooltip title="Remove promo code">
            <IconButton
              onClick={() => {
                setPromoCode("");
                onClear();
              }}
              disabled={disabled}
              sx={{ mt: 0.5 }}
            >
              ×
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            variant="outlined"
            onClick={apply}
            disabled={disabled || promoCode.trim().length < 3}
            sx={{ flexShrink: 0, mt: 0.25, height: 40 }}
          >
            Apply
          </Button>
        )}
      </Box>
    </Surface>
  );
}
