// @ts-nocheck
import NextAuth from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'
import LinkedInProvider from 'next-auth/providers/linkedin'
import FacebookProvider from 'next-auth/providers/facebook'
import InstagramProvider from 'next-auth/providers/instagram'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import DiscordProvider from 'next-auth/providers/discord'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const authConfig = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'tweet.read tweet.write users.read follows.read follows.write offline.access',
        },
      },
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid profile email w_member_social r_liteprofile r_emailaddress',
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'pages_manage_posts,pages_read_engagement,pages_show_list,business_management',
        },
      },
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'user_profile,user_media,instagram_basic,instagram_content_publish',
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'user:email read:user repo public_repo',
        },
      },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds bot',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return false

      try {
        const payload = await getPayload({ config: configPromise })

        // Find the user in our Payload system
        const existingUser = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: user.email,
            },
          },
          limit: 1,
        })

        if (!existingUser.docs.length) {
          // User doesn't exist in our system - they need to register first
          console.log('User not found in Payload system:', user.email)
          return '/auth/register?error=UserNotFound'
        }

        const payloadUser = existingUser.docs[0]

        // Get user's tenant (assuming they have a default tenant)
        let userTenant = null
        if (payloadUser.tenant) {
          userTenant = typeof payloadUser.tenant === 'object' ? payloadUser.tenant.id : payloadUser.tenant
        } else {
          // Find user's first tenant membership
          const membership = await payload.find({
            collection: 'tenant-memberships',
            where: {
              user: {
                equals: payloadUser.id,
              },
            },
            limit: 1,
          })

          if (membership.docs.length > 0) {
            userTenant = typeof membership.docs[0].tenant === 'object'
              ? membership.docs[0].tenant.id
              : membership.docs[0].tenant
          }
        }

        if (!userTenant) {
          console.log('No tenant found for user:', user.email)
          return '/auth/error?error=NoTenant'
        }

        // Check if this linked account already exists
        const existingLinkedAccount = await payload.find({
          collection: 'linked-accounts',
          where: {
            and: [
              {
                user: {
                  equals: payloadUser.id,
                },
              },
              {
                provider: {
                  equals: account.provider,
                },
              },
            ],
          },
          limit: 1,
        })

        const linkedAccountData = {
          provider: account.provider,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
          scope: account.scope,
          providerAccountId: account.providerAccountId,
          providerAccountData: {
            ...profile,
            tokenType: account.token_type,
          },
          user: payloadUser.id,
          tenant: userTenant,
          status: 'active',
          lastUsed: new Date(),
        }

        if (existingLinkedAccount.docs.length > 0) {
          // Update existing linked account
          await payload.update({
            collection: 'linked-accounts',
            id: existingLinkedAccount.docs[0].id,
            data: linkedAccountData,
          })
          console.log(`Updated ${account.provider} linked account for user ${user.email}`)
        } else {
          // Create new linked account
          await payload.create({
            collection: 'linked-accounts',
            data: linkedAccountData,
          })
          console.log(`Created new ${account.provider} linked account for user ${user.email}`)
        }

        return true
      } catch (error) {
        console.error('OAuth callback error:', error)
        return '/auth/error?error=CallbackError'
      }
    },
    async jwt({ token, account, user }) {
      // Persist the OAuth account token to the JWT token
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      return {
        ...session,
        accessToken: token.accessToken,
        provider: token.provider,
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async linkAccount({ user, account, profile }) {
      console.log('Account linked:', {
        user: user.email,
        provider: account.provider,
        providerAccountId: account.providerAccountId
      })
    },
    async unlinkAccount({ user, account }) {
      console.log('Account unlinked:', {
        user: user.email,
        provider: account.provider
      })

      // Mark the linked account as revoked in our database
      try {
        const payload = await getPayload({ config: configPromise })

        const existingUser = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: user.email,
            },
          },
          limit: 1,
        })

        if (existingUser.docs.length > 0) {
          await payload.update({
            collection: 'linked-accounts',
            where: {
              and: [
                {
                  user: {
                    equals: existingUser.docs[0].id,
                  },
                },
                {
                  provider: {
                    equals: account.provider,
                  },
                },
              ],
            },
            data: {
              status: 'revoked',
            },
          })
        }
      } catch (error) {
        console.error('Error marking account as revoked:', error)
      }
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
