import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

export const ContactForm = () => {
  const { t } = useLanguage();
  const [sendSuccess, setSendSuccess] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setSendSuccess(true);
      } else {
        setSendSuccess(false);
      }
    } catch (error) {
      console.log("An error occurred. Please try again later.", error);
      setSendSuccess(false);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 w-full md:w-1/2 p-4">
        <div>
          <label htmlFor="name" className="block mb-2">
            {t("contact.name")}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full p-2 border rounded text-black"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-2">
            {t("contact.email")}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full p-2 border rounded text-black"
          />
        </div>

        <div>
          <label htmlFor="message" className="block mb-2">
            {t("contact.message")}
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            className="w-full p-2 border rounded text-black"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
        {t("contact.send")}
        </button>
      </form>

      {typeof sendSuccess === "boolean" && (
        <p
          className={`mt-4 p-2 rounded ${
            sendSuccess ? "bg-green-900" : "bg-red-900"
          }`}
        >
          {sendSuccess ? t("contact.success") : t("contact.error")}
        </p>
      )}
    </>
  );
};
