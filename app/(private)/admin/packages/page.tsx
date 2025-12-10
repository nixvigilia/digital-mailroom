import PackageManagementClient from "./PackageManagementClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Package Management | Admin Portal",
};

export default function PackageManagementPage() {
  return <PackageManagementClient />;
}

