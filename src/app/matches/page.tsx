"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "../profile/page";
import { getPotentialMatches } from "@/actions/profile";
import { useRouter } from "next/navigation";
import CardMatches from "@/src/components/card-matches";
import CardMatchesButton from "@/src/components/card-matches-button";
import { likeUser } from "@/actions/matches/like-user";
import MathNotification from "@/src/components/math-notification";
import { useAuth } from "@/context/auth-context";

export default function MatchesPage() {
  const [potencialMatches, setPotencialMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | undefined>(
    undefined
  );

  const { user } = useAuth();

  if (!user) {
    router.push("/auth");
  }

  useEffect(() => {
    async function loadUsers() {
      //   setLoading(true);
      try {
        const potencialMatchesData = await getPotentialMatches();
        setPotencialMatches(potencialMatchesData);
      } catch (error) {
        console.log("Error gettin users", error);
        return null;
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const currentPotencialUser = potencialMatches[currentIndex];

  /**
   * Handles passing a user by incrementing the current index
   * to move on to the next potential match.
   */
  const handlePass = () => {
    if (currentIndex < potencialMatches.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  /**
   * Handles liking a user by liking the current user, then moving on to the next potential match.
   * If the like is successful and the user is a match, the matched user is stored in state and a notification is shown.
   * If the like is unsuccessful, an error is logged to the console.
   * @returns {Promise<void>} A promise that resolves when the like operation is complete.
   */

  const handeLike = async () => {
    if (currentIndex < potencialMatches.length) {
      const currentUser = potencialMatches[currentIndex];
      try {
        const result = await likeUser(currentUser.id);
        if (result.isMatch) {
          setMatchedUser(result.matchedUser);
          setShowNotification(true);
        }
        setCurrentIndex((prev) => prev + 1);
      } catch (error) {
        console.log("Error liking user", error);
      }
    }
  };

  const handleCloseMatchNotification = () => {};

  const handleStartChat = () => {};

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Finding your matches...
          </p>
        </div>
      </div>
    );
  }

  if (currentIndex >= potencialMatches.length) {
    return (
      <div className="h-full bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No more profiles to show
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Check back later for new matches, or try adjusting your preferences!
          </p>
          <button
            onClick={() => setCurrentIndex(0)}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
          >
            Refresh
          </button>
        </div>
        {showNotification && matchedUser && (
          <MathNotification
            match={matchedUser}
            onClose={handleCloseMatchNotification}
            onStartChat={handleStartChat}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-gray-700/50 transition-colors duration-200"
              title="Go back"
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex-1" />
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Discover Matches
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentIndex + 1} of {potencialMatches.length} profiles
            </p>
          </div>
        </header>

        <div className="max-w-md mx-auto">
          <CardMatches user={currentPotencialUser} />

          <div className="mt-8">
            <CardMatchesButton onLike={handeLike} onPass={handlePass} />
          </div>
        </div>

        {showNotification && matchedUser && (
          <MathNotification
            match={matchedUser}
            onClose={handleCloseMatchNotification}
            onStartChat={handleStartChat}
          />
        )}
      </div>
    </div>
  );
}
