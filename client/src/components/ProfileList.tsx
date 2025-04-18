import React from 'react';

interface LinkedInProfile {
  _id: string;
  name: string;
  jobTitle: string;
  company: string;
  location: string;
  profileUrl: string;
  scrapedAt: string;
}

interface ProfileListProps {
  profiles: LinkedInProfile[];
}

const ProfileList: React.FC<ProfileListProps> = ({ profiles }) => {
  return (
    <div className="mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Scraped Profiles</h2>
      {profiles.length === 0 ? (
        <p>No profiles found. Try scraping with a search URL.</p>
      ) : (
        <>
          {/* Responsive Table for Larger Screens */}
          <div className="hidden sm:block">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Job Title</th>
                  <th className="border p-2">Company</th>
                  <th className="border p-2">Location</th>
                  <th className="border p-2">Profile URL</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile._id} className="hover:bg-gray-100">
                    <td className="border p-2">{profile.name}</td>
                    <td className="border p-2">{profile.jobTitle}</td>
                    <td className="border p-2">{profile.company}</td>
                    <td className="border p-2">{profile.location}</td>
                    <td className="border p-2">
                      <a
                        href={profile.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Profile
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card-Based Layout for Small Screens */}
          <div className="block sm:hidden">
            {profiles.map((profile) => (
              <div
                key={profile._id}
                className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg"
              >
                <h3 className="text-xl font-bold">{profile.name}</h3>
                <p className="text-gray-700">
                  <strong>Job Title:</strong> {profile.jobTitle}
                </p>
                <p className="text-gray-700">
                  <strong>Company:</strong> {profile.company}
                </p>
                <p className="text-gray-700">
                  <strong>Location:</strong> {profile.location}
                </p>
                <a
                  href={profile.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Profile
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileList;
