import Link from "next/link";
import IslandApp from "@/components/IslandApp";

export default function Home() {
  return (
    <>
      <IslandApp />
      <noscript>
        <div className="p-8 text-center">
          The island needs JavaScript. <Link href="/work">See the portfolio without it →</Link>
        </div>
      </noscript>
    </>
  );
}
