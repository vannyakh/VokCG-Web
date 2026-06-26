import { redirect } from "next/navigation";

import { USER_ROUTES } from "@vokcg/constants";

export default function HomePage() {
  redirect(USER_ROUTES.create);
}
