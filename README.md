# EHF News — PWA starter

## এই সংস্করণে কী আছে
- বাংলা responsive news/alert interface
- বাংলাদেশের ৬৪ জেলার নির্বাচন
- সারা বাংলাদেশ অথবা নির্বাচিত জেলার জন্য লোকাল ডেমো alert
- Notification permission request এবং এই ডিভাইসে demo notification
- PWA manifest ও service worker

## চালানোর নিয়ম
1. সব ফাইল একই ফোল্ডারে রাখুন।
2. HTTPS-এ হোস্ট করুন (GitHub Pages ব্যবহার করা যায়) অথবা localhost-এ চালান।
3. Chrome/Android থেকে সাইট খুলে “নোটিফিকেশন চালু করুন” চাপুন।
4. অ্যাডমিন ডেমো প্যানেল থেকে একটি সতর্কবার্তা প্রকাশ করে পরীক্ষা করুন।

## গুরুত্বপূর্ণ সীমাবদ্ধতা
এই starter-এ real multi-user push, স্বয়ংক্রিয় আবহাওয়া সতর্কতা, সরকারি ফিড, authentication বা নিরাপদ admin backend এখনো সংযুক্ত নয়। ডেমো alert শুধু একই browser/device-এ সংরক্ষিত হয়। অন্য ব্যবহারকারীর ফোনে background push পাঠাতে Firebase Cloud Messaging (FCM), HTTPS, Firebase project, server-side function এবং admin authentication লাগবে। FCM web push-এর জন্য VAPID key-ও সেট করতে হবে। কোনো secret key কখনো `app.js`-এ রাখবেন না।

## পরের ধাপ
1. Firebase project ও Web App তৈরি
2. FCM service worker + VAPID configuration
3. নিরাপদ admin login ও database
4. Bangladesh Meteorological Department / সরকারি দুর্যোগ সতর্কতার যাচাইকৃত উৎস সংযুক্তি
5. জেলা অনুযায়ী topic subscription ও push delivery test

সরকারি সতর্কতার উৎস যাচাই না করে কোনো alert-কে সরকারি ঘোষণা হিসেবে প্রকাশ করবেন না।


## স্বয়ংক্রিয় সংবাদ সংগ্রহ (নতুন)
- `scripts/fetch_news.py` প্রকাশকদের পাবলিক RSS/Atom ফিড থেকে শিরোনাম, সংক্ষিপ্ত বিবরণ, প্রকাশক, সময় ও মূল লিংক সংগ্রহ করে।
- `.github/workflows/update-news.yml` প্রতি ৩০ মিনিটে GitHub Actions চালিয়ে `data/news.json` আপডেট করে। চাইলে Actions ট্যাব থেকে `Update EHF News feeds` workflow-টি `Run workflow` দিয়েও হাতে চালানো যায়।
- GitHub Pages `data/news.json` পড়ে খবর দেখায়। প্রথম workflow সফলভাবে না চলা পর্যন্ত খবরের তালিকা খালি থাকতে পারে।
- কিছু RSS ফিড সাময়িকভাবে বন্ধ, পরিবর্তিত, বা GitHub runner থেকে অনুপলব্ধ হতে পারে; তখন অন্য উৎসগুলো চলবে এবং workflow log-এ ব্যর্থ উৎস দেখা যাবে।
- প্রকাশকের শিরোনাম/সংক্ষিপ্ত feed summary ও লিংক দেখানো হয়; পূর্ণ নিবন্ধ কপি করা হয় না। প্রতিটি খবরের মূল লিংক ব্যবহার করুন এবং সংশ্লিষ্ট প্রকাশকের শর্ত মেনে চলুন।
- এটি RSS ভিত্তিক স্বয়ংক্রিয় headline feed; এখনো AI fact-checking, breaking-news classification, district-level news matching, weather alert automation বা multi-user push notification নয়।
