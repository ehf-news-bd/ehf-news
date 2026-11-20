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
