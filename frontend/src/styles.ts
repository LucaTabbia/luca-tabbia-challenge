import { Theme } from "@emotion/react";
import { SxProps } from "@mui/material";

export const boxContainer: SxProps<Theme> = {
    p: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "20vh"
};

export const stackColumnCenter: SxProps<Theme> = {
    direction: "column",
    alignItems: "center",
};

export const stackRowCenter: SxProps<Theme> = {
    direction: "row",
    justifyContent: "space-between",
    alignItems: "center",
};