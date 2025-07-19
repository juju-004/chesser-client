// components/TermsOfService.tsx
export default function TermsOfService() {
  return (
    <div className="container mx-auto p-6 rounded-2xl pt-11 space-y-6">
      <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">
        <span className="opacity-35">#</span> Terms of Service
      </h1>

      <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
        <p>
          Welcome to <span className="font-semibold">Chesser</span>, a platform
          where players can compete in real-time chess matches and stake funds
          for competitive play. By using our platform, you agree to these terms.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          1. User Eligibility
        </h2>
        <p>
          You must be at least 18 years old and legally allowed to participate
          in skill-based competitions involving monetary stakes under your local
          laws.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          2. Game Stakes and Fees
        </h2>
        <p>
          When participating in a match with monetary stakes, a service fee of{" "}
          <strong>X%</strong> will be deducted from the total prize pool. This
          fee supports server maintenance, security, and platform development.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          3. Fair Play
        </h2>
        <p>
          Cheating, engine assistance, or exploiting any bugs is strictly
          prohibited. Accounts found violating fair play policies may be
          suspended or permanently banned.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          4. Payouts
        </h2>
        <p>
          Winnings will be credited to the user’s wallet immediately after a
          verified game result. Withdrawals may require identity verification in
          compliance with legal and anti-fraud measures.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          5. Liability
        </h2>
        <p>
          Chesser is not liable for losses due to network disconnections, user
          errors, or game interruptions. We recommend a stable internet
          connection during play.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          6. Changes to Terms
        </h2>
        <p>
          We may update these terms periodically. Continued use of the platform
          implies agreement with the latest terms.
        </p>
      </section>

      <h1 className="text-3xl font-bold mt-20 text-zinc-800 dark:text-white">
        <span className="opacity-35">#</span> Privacy Policy
      </h1>

      <section className="space-y-4 text-zinc-700 dark:text-zinc-300">
        <p>
          Your privacy is important to us at{" "}
          <span className="font-semibold">Chesser</span>. This policy explains
          how we collect, use, and protect your information.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          1. Information We Collect
        </h2>
        <p>
          We collect personal data such as your name, email address, wallet
          address, and game statistics. For financial transactions, additional
          verification info may be required.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          2. How We Use Your Data
        </h2>
        <p>
          Your data helps us provide game services, manage transactions, prevent
          fraud, and improve platform functionality. We do not sell your data to
          third parties.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          3. Cookies and Tracking
        </h2>
        <p>
          We use cookies to maintain sessions, remember preferences, and enhance
          user experience. You may disable cookies in your browser, but some
          features may stop working.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          4. Data Sharing
        </h2>
        <p>
          We only share data with third-party services used for authentication,
          payment processing, and security. All vendors are bound by
          confidentiality agreements.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          5. Security
        </h2>
        <p>
          We use encryption, access control, and secure protocols to protect
          your data. While we strive to safeguard information, no system is 100%
          secure.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          6. Your Rights
        </h2>
        <p>
          You can request to view, update, or delete your data by contacting
          support. Some data may be retained for legal or security reasons.
        </p>

        <h2 className="text-xl font-semibold text-zinc-800 dark:text-white">
          7. Policy Updates
        </h2>
        <p>
          We may update this Privacy Policy as laws or our platform evolves.
          We’ll notify users of major changes via email or in-app notice.
        </p>
      </section>

      <p className="text-sm text-zinc-500 text-center">
        Last updated: July 19, 2025
      </p>
    </div>
  );
}
