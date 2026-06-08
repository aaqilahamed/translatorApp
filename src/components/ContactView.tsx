import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Send, CheckCircle2, User, HelpCircle, MapPin, Phone } from "lucide-react";

export default function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    
    // Simulate API storage post delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      // Clear inputs
      setName("");
      setEmail("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 text-left" id="contact-view-panel">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-sky-455 w-fit mx-auto">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
          Get in Touch
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
          We value your questions or features suggestions. Fill out the contact desk below!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Contact Info Widget Column - 5cols */}
        <div className="md:col-span-5 flex flex-col gap-6 p-6 rounded-2xl border border-slate-150/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-white border-b pb-2">
            Support Headquarters
          </h3>
          
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Our teams construct systems that enhance linguistic bridge building across the world. Speak with standard coordinators or notify us of bugs anytime.
          </p>

          <div className="space-y-4 pt-4 flex-1">
            <div className="flex gap-3 items-start text-xs sm:text-sm">
              <div className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-indigo-600 dark:text-sky-400 rounded-lg">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Workspace address</span>
                <span className="text-slate-500 dark:text-slate-400">Google Cloud Run Sandboxed Container, Port 3000</span>
              </div>
            </div>

            <div className="flex gap-3 items-start text-xs sm:text-sm">
              <div className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-indigo-600 dark:text-sky-400 rounded-lg">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Contact Desk</span>
                <span className="text-slate-500 dark:text-slate-400">support@universal-translator.internal</span>
              </div>
            </div>

            <div className="flex gap-3 items-start text-xs sm:text-sm">
              <div className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-indigo-600 dark:text-sky-400 rounded-lg">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Phone Response</span>
                <span className="text-slate-500 dark:text-slate-400">+1 (800) TRANSLATE-AI</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-dashed border-indigo-150 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-sky-400 uppercase tracking-widest block mb-1">Response Guarantee</span>
            <p className="text-[10px] text-slate-500 leading-normal">
              Internal translation quality review systems inspect ticket logs within 24 working hours to guarantee response.
            </p>
          </div>
        </div>

        {/* Contact Form Column - 7cols */}
        <div className="md:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-center min-h-[350px]">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="contact-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    Your Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-sky-500 outline-none rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 dark:text-slate-200 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    Your Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-sky-500 outline-none rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 dark:text-slate-200 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                    Your Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details of any technical bugs, language suggestions, or translation ideas..."
                    required
                    className="w-full min-h-[110px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-sky-500 outline-none rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 resize-none transition"
                  />
                </div>

                <button
                  id="submit-contact-form-btn"
                  type="submit"
                  disabled={isSubmitting || !name || !email || !message}
                  className="w-full py-3.5 font-bold rounded-xl cursor-pointer select-none text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="contact-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4 p-6"
              >
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8 animate-bounce-slow" />
                </div>
                <h4 className="font-sans font-extrabold text-xl text-slate-900 dark:text-white">
                  Message Dispatched Safely!
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Thank you for your response. Our translation maintenance dispatch has filed your ticket and will verify details promptly.
                </p>
                <button
                  id="toggle-back-contact-form-btn"
                  onClick={() => setSubmitted(false)}
                  className="cursor-pointer px-5 py-2.5 rounded-xl border text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850/60 text-slate-700 dark:text-slate-300 transition"
                >
                  Send another feedback
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
