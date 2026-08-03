/**
 * Identifier assigned by the program that
 * generates any kind of query.  This identifier is copied
 * the corresponding reply and can be used by the requester
 * to match up replies to outstanding queries.
 *
 * @size 16 bits
 */
export type PacketId = number;

/**
 * Specifies whether this message is a
 * query (0), or a response (1).
 *
 * @size 1 bit
 */
export type QueryResponseIndicator = 0 | 1;

/**
 * A four bit field that specifies kind of query in this
 * message. This value is set by the originator of a query
 * and copied into the response.
 *
 * The values are:
 * 0 - a standard query (QUERY)
 * 1 - an inverse query (IQUERY)
 * 2 - a server status request (STATUS)
 * 3-15 - reserved for future use
 *
 * @size 4 bits
 */
export type OperationCode =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15;

/**
 * Specifies whether the responding server is an
 * authoritative server for the domain name in the query.
 *
 * @size 1 bit
 */
export type AuthorativeAnswer = 0 | 1;

/**
 * Specifies whether this message was truncated
 * due to length greater than that permitted on the
 * transmission channel.
 *
 * @size 1 bit
 */
export type Truncation = 0 | 1;

/**
 * Specifies whether the client wants to use recursive query or not. If this bit is set, the
 * name server will pursue the query recursively. Recursive
 * query support is optional.
 *
 * @size 1 bit
 */
export type RecursionDesired = 0 | 1;

/**
 * Specifies whether the name server supports recursive query or not. If this bit is set, the
 * name server supports recursive query. Recursive
 * query support is optional.
 *
 * @size 1 bit
 */
export type RecursionAvailable = 0 | 1;

/**
 * Reserved for future use.  Must be zero in all queries and responses.
 *
 * @size 3 bits
 */
export type Reserved = 0;

/**
 * Specifies the kind of response in this message.  This
 * value is set by the originator of a query and copied into the response.
 *
 * The values are:
 * 0 - No error condition
 * 1 - Format error - The name server was unable to interpret the query.
 * 2 - Server failure - The name server was unable to process this query due to a problem with the name server.
 * 3 - Name Error - Meaningful only for responses from an authoritative name server, this code signifies that the domain name referenced in the query does not exist.
 * 4 - Not Implemented - The name server does not support the requested kind of query.
 * 5 - Refused - The name server refuses to perform the specified operation for policy reasons. For example, a name server may not wish to provide the information to the particular requester, or a name server may not wish to perform a particular operation (e.g., zone transfer) for particular data.
 * 6-15 - Reserved for future use.
 *
 * @size 4 bits
 */
export type ResponseCode =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15;

/**
 * Specifies the number of entries in the question section.
 *
 * @size 16 bits
 */
export type QuestionCount = number;

/**
 * Specifies the number of entries in the answer section.
 *
 * @size 16 bits
 */
export type AnswerCount = number;

/**
 * Specifies the number of entries in the authority records section.
 *
 * @size 16 bits
 */
export type AuthorityCount = number;

/**
 * Specifies the number of entries in the additional records section.
 *
 * @size 16 bits
 */
export type AdditionalCount = number;

export interface DNSHeaderInterface {
  packetId: PacketId;
  queryResponseIndicator: QueryResponseIndicator;
  operationCode: OperationCode;
  authorativeAnswer: AuthorativeAnswer;
  truncation: Truncation;
  recursionDesired: RecursionDesired;
  recursionAvailable: RecursionAvailable;
  reserved: Reserved;
  responseCode: ResponseCode;
  questionCount: QuestionCount;
  answerCount: AnswerCount;
  authorityCount: AuthorityCount;
  additionalCount: AdditionalCount;
}
