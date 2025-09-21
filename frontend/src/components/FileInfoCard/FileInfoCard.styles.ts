import { Theme } from "@emotion/react";
import { SxProps } from "@mui/material";

export const fileCard: SxProps<Theme> = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    mb: 2,
    p: 1.5,
    boxShadow: 2,
    borderRadius: 2,
    minHeight: 80,
};

export const cardContent: SxProps<Theme> = {
    flex: 1,
    padding: "8px 12px !important",
    "&:last-child": {
        paddingBottom: "8px",
    },
}