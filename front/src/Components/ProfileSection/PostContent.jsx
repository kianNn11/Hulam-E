import React from 'react';
import './PostContent.css';
import { PhoneIcon, AcademicCapIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { Venus, Cake, User } from "lucide-react";
import { UserCircleIcon, LinkIcon } from "@heroicons/react/24/outline";
import { Link } from 'react-router-dom';

const PostContent = ({ profileData, user }) => {
  // Use user data as fallback for profileData
  const displayData = {
    fullName: profileData?.fullName || user?.name || 'Not provided',
    courseYear: profileData?.courseYear || user?.course_year || 'Not provided',
    birthday: profileData?.birthday || user?.birthday || 'Not provided',
    gender: profileData?.gender || user?.gender || 'Not provided',
    socialLink: profileData?.socialLink || user?.social_link || '',
    contactNumber: profileData?.contactNumber || user?.contact_number || 'Not provided',
    bio: profileData?.bio || user?.bio || 'Not provided',
    profileImage: profileData?.profileImage || user?.profile_picture || null,
    email: user?.email || 'Not provided'
  };

  // Format birthday for better display
  const formatBirthday = (birthday) => {
    if (!birthday || birthday === 'Not provided') return 'Not provided';
    try {
      const date = new Date(birthday);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return birthday;
    }
  };

  return (
    <main className="postContent">
      <section className="contentSection">
        <div className="contentColumns">

          {/* About Section */}
          <div className="column">
            <div className="aboutContainer">
              <div className="aboutColumns">

                {/* Main About Info */}
                <div className="aboutMainColumn">
                  <div className="aboutContent">
                    <h2 className="sectionTitle">About</h2>
                    
                    {/* Bio Section */}
                    {displayData.bio && displayData.bio !== 'Not provided' && (
                      <div className="bioSection">
                        <p className="bioText">{displayData.bio}</p>
                      </div>
                    )}

                    <div className="personalInfo">

                      <div className="infoItem">
                        <div className="infoRow">
                          <User className="icon" />
                          <div>
                            <h3 className="infoLabel">Full Name</h3>
                            <p className="infoValue">{displayData.fullName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <EnvelopeIcon className="icon" />
                          <div>
                            <h3 className="infoLabel">Email</h3>
                            <p className="infoValue">{displayData.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <AcademicCapIcon className="icon" />
                          <div>
                            <h3 className="infoLabel">Course & Year Level</h3>
                            <p className="infoValue">{displayData.courseYear}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <Cake className="icon" />
                          <div>
                            <h3 className="infoLabel">Birthday</h3>
                            <p className="infoValue">{formatBirthday(displayData.birthday)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <Venus className="icon" />
                          <div>
                            <h3 className="infoLabel">Gender</h3>
                            <p className="infoValue">{displayData.gender}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <PhoneIcon className="icon" />
                          <div>
                            <h3 className="infoLabel">Contact Number</h3>
                            <p className="infoValue">{displayData.contactNumber}</p>
                          </div>
                        </div>
                      </div>

                      <div className="infoItem">
                        <div className="infoRow">
                          <LinkIcon className="icon" />
                          <div>
                            <h3 className="infoLabel">Social Link</h3>
                            {displayData.socialLink ? (
                              <a
                                href={displayData.socialLink}
                                className="socialLink"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {displayData.socialLink}
                              </a>
                            ) : (
                              <p className="infoValue">Not provided</p>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="postsColumn">
            <div className="postsContainer">
              <h2 className="sectionTitle">Posts</h2>

              <div className="postItem">
                <div className="notificationOutline">
                  <UserCircleIcon className="postIcon" />
                  <p className="postNotification">
                    You posted in <strong>Rental.</strong>{" "}
                    <Link to="/post/1" className="viewPostLink">View Post here.</Link>
                  </p>
                </div>
              </div>

              {/* Placeholder for future posts */}
              <div className="emptyState">
                <p>No recent posts to display</p>
                <Link to="/post" className="createPostLink">Create your first post</Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Profile Summary Card */}
      {displayData.profileImage && (
        <div className="profileSummary">
          <div className="profileSummaryCard">
            <img 
              src={displayData.profileImage} 
              alt={`${displayData.fullName}'s profile`} 
              className="profileSummaryImage"
            />
            <div className="profileSummaryInfo">
              <h3>{displayData.fullName}</h3>
              <p>{displayData.courseYear}</p>
              {user?.verified && (
                <span className="verifiedBadge">✓ Verified Student</span>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PostContent;