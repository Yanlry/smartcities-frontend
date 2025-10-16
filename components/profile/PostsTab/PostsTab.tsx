// components/profile/PostsTab/PostsTab.tsx

import React, { memo, useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { profileStyles } from "../../../styles/screens/UserProfileScreen.styles";

import { PostsTabProps } from "../../../types/features/profile/tabs.types";

/**
 * Composant affichant la liste des publications d'un utilisateur
 */
export const PostsTab: React.FC<PostsTabProps> = memo(({ posts, navigation }) => {
  // État local pour gérer la visibilité des commentaires par post
  const [commentsVisible, setCommentsVisible] = useState<{ [key: number]: boolean }>({});

  /**
   * Fonction pour basculer la visibilité des commentaires pour un post spécifique
   */
  const toggleComments = useCallback((postId: number) => {
    setCommentsVisible(prevState => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  }, []);

  return (
    <>
      {posts.length === 0 ? (
        <View style={profileStyles.noDataContainer}>
          <Text style={profileStyles.noDataText}>
            Aucune publication trouvée.
          </Text>
        </View>
      ) : (
        <View>
          {posts.map((item) => (
            <TouchableOpacity
              key={item.id.toString()}
              onPress={() =>
                navigation.navigate("PostDetailsScreen", { postId: item.id })
              }
            >
              <View style={profileStyles.postCard}>
                {/* En-tête du post avec informations sur l'auteur */}
                <View style={profileStyles.postHeader}>
                  <Image
                    source={{
                      uri: item.profilePhoto || "https://via.placeholder.com/150",
                    }}
                    style={profileStyles.profilePhoto}
                  />
                  <View style={profileStyles.authorInfo}>
                    <Text style={profileStyles.authorName}>{item.authorName}</Text>
                    <Text style={profileStyles.postDate}>
                      Publié le {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* Contenu du post */}
                <Text style={profileStyles.postContent}>{item.content}</Text>

                {/* Photos du post si disponibles */}
                {item.photos && item.photos.length > 0 && (
                  <View style={profileStyles.photosContainer}>
                    {item.photos.map((photo, index) => (
                      <Image
                        key={index.toString()}
                        source={{ uri: photo }}
                        style={profileStyles.photo}
                      />
                    ))}
                  </View>
                )}

                {/* Métadonnées: likes */}
                <View style={profileStyles.metaInfo}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialCommunityIcons
                      name="thumb-up"
                      size={14}
                      color="#555"
                      style={{ marginRight: 5 }} 
                    />
                    <Text style={profileStyles.likesCount}>
                      {item.likesCount} personnes ont liké
                    </Text>
                  </View>
                </View>

                {/* Bouton pour afficher/masquer les commentaires */}
                <TouchableOpacity onPress={() => toggleComments(item.id)}>
                  <Text style={profileStyles.toggleCommentsButton}>
                    {commentsVisible[item.id]
                      ? "Masquer les commentaires"
                      : "Afficher les commentaires"}
                  </Text>
                </TouchableOpacity>

                {/* Section des commentaires */}
                {commentsVisible[item.id] && (
                  <View style={profileStyles.commentsContainer}>
                    {item.comments && item.comments.length > 0 ? (
                      <>
                        <Text style={profileStyles.commentsHeader}>Commentaires :</Text>
                        {item.comments.map((comment) => (
                          <View key={comment.id.toString()} style={profileStyles.comment}>
                            <Image
                              source={{ uri: comment.userProfilePhoto }}
                              style={profileStyles.commentProfilePhoto}
                            />
                            <View style={profileStyles.commentContent}>
                              <Text style={profileStyles.commentUserName}>
                                {comment.userName}
                              </Text>
                              <Text style={profileStyles.commentDate}>
                                Publié le {new Date(comment.createdAt).toLocaleDateString()}
                              </Text>
                              <Text style={profileStyles.commentText}>
                                {comment.text}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </>
                    ) : (
                      <Text style={profileStyles.noCommentText}>
                        Aucun commentaire pour le moment
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
});

PostsTab.displayName = 'PostsTab';