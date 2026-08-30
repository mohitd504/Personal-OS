import type { Metadata } from "next";
import SystemDesignLab from "./system-design-lab";
import "./system-design.css";

export const metadata: Metadata = {
  title: "System Design Lab | Personal OS",
  description: "Learn scalability, databases, DNS, APIs and communication styles through visual lessons and interactive quizzes.",
};

export default function SystemDesignPage() {
  return <SystemDesignLab />;
}
