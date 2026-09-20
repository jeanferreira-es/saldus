import "styled-components/native";
import { AppPalette } from "./palette";

declare module "styled-components/native" {
  export interface DefaultTheme extends AppPalette {}
}
