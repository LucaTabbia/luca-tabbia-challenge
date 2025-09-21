import { Theme } from "@emotion/react";
import { SxProps } from "@mui/material";

export const listContainer: SxProps<Theme> = {
    p: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "20vh"
};