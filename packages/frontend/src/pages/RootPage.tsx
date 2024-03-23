import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTE_LANDING } from "../const/routes";
import { CenterSpinner } from "../features/loading";

export default function RootPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(ROUTE_LANDING);
  }, [navigate]);

  return (
    <>
      <CenterSpinner></CenterSpinner>
    </>
  );
}
