import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, Clock, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Medical & AI Health Blog — MediConnect AI',
  description: 'Explore the latest insights on healthcare innovation, AI-assisted diagnostics, wellness tips, and doctor advice.',
};

const blogPosts = [
  {
    id: 1,
    title: 'How AI Is Revolutionizing Early Disease Detection and Triage',
    slug: 'ai-revolutionizing-disease-detection',
    excerpt: 'Discover how artificial intelligence and machine learning models assist clinicians in identifying symptoms earlier and routing patients to proper specialists.',
    category: 'AI Healthcare',
    author: 'Dr. Sarah Mitchell, MD',
    date: 'Sep 05, 2026',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    featured: true,
  },
  {
    id: 2,
    title: '10 Essential Questions to Ask During Your Online Doctor Consultation',
    slug: 'questions-for-online-doctor-consultation',
    excerpt: 'Make the most of your telehealth appointments with these expert-recommended tips for clear communication and effective treatment plans.',
    category: 'Patient Guide',
    author: 'Dr. Ahmed Khan',
    date: 'Sep 02, 2026',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Understanding Digital Prescriptions & Safe Medicine Tracking',
    slug: 'digital-prescriptions-medicine-tracking',
    excerpt: 'Learn how instant e-prescriptions reduce dosage errors and make refilling medications seamless across modern pharmacies.',
    category: 'Health Tech',
    author: 'MediConnect Medical Team',
    date: 'Aug 28, 2026',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    title: 'Preventive Cardiology: Heart Health Habits That Make a Lifetime Difference',
    slug: 'preventive-cardiology-heart-health',
    excerpt: 'Simple daily lifestyle adjustments and digital monitoring tools to safeguard cardiovascular health and prevent heart conditions.',
    category: 'Wellness',
    author: 'Dr. Emily Watson, Cardiologist',
    date: 'Aug 22, 2026',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
  },
];

export default function BlogPage() {
  const [featuredPost, ...otherPosts] = blogPosts;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Health Insights & Research</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white font-heading tracking-tight mb-4">
            MediConnect <span className="gradient-text">Health Blog</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">
            Stay informed with verified medical insights, artificial intelligence breakthroughs in medicine, and wellness guides curated by top doctors.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-64 lg:h-auto min-h-[320px]">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute top-4 left-4">
                <Badge variant="primary">Featured Story</Badge>
              </div>
            </div>
            <div className="p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span className="font-semibold text-primary-600 dark:text-primary-400">{featuredPost.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {featuredPost.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-heading mb-4 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
                  {featuredPost.excerpt}
                </p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4 text-primary-500" />
                  <span>{featuredPost.author}</span>
                </div>
                <Link
                  href="/ai-symptom-checker"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:gap-2.5 transition-all"
                >
                  Explore AI Tools <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Other Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {otherPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="outline" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xs">
                    {post.category}
                  </Badge>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading mb-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{post.author}</span>
                  <Link
                    href="/doctors"
                    className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1"
                  >
                    Find Doctors <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-linear-to-r from-primary-600 to-accent-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl">
          <BookOpen className="w-10 h-10 mx-auto mb-4 text-white/90" />
          <h2 className="text-2xl sm:text-3xl font-bold font-heading mb-3">Need Personalized Medical Advice?</h2>
          <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base mb-6">
            Consult verified specialists online or try our AI Symptom Checker for immediate assessment.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/doctors"
              className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-all text-sm shadow-md"
            >
              Book an Appointment
            </Link>
            <Link
              href="/ai-symptom-checker"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl transition-all text-sm"
            >
              Start AI Symptom Checker
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
